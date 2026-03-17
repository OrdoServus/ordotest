'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { useAuth } from '../AuthContext';
import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, QueryDocumentSnapshot, QuerySnapshot, DocumentData, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { OutputData } from '@editorjs/editorjs';

const Editor = dynamic(() => import('../components/Editor'), { ssr: false });
import NotebooksColumn from '../components/NotebooksColumn';
import SectionsAndPagesColumn from '../components/SectionsAndPagesColumn';
import ContextMenu from '../components/ContextMenu';
import NotebookDashboard from '../components/NotebookDashboard';

// --- Interfaces & Konstanten ---
interface Notebook {
  id: string;
  name: string;
  user_id: string;
  created_at: any;
}
interface Section {
  id: string;
  name: string;
  notebook_id: string;
  user_id: string;
  created_at: any;
}
// KORRIGIERT: `inhalt` ist jetzt vom Typ `OutputData`
interface Page {
  id: string;
  titel: string;
  inhalt: OutputData;
  sectionId: string;
  user_id: string;
  isFavorit: boolean;
  datum: any;
}
type ContextMenuTarget = { x: number; y: number; type: 'notebook' | 'section' | 'page'; id: string; name: string; };
type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';
const EMPTY_INHALT: OutputData = { blocks: [] }; // Leerer Editor-Inhalt

// --- Hauptkomponente ---
export default function NotizenPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Original-States
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);

  // NEU: States & Refs für Auto-Save
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<{ titel?: string; inhalt?: OutputData }>({});
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Originale Daten-Lade-Logik (unverändert)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'notebooks'), orderBy('created_at', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedNotebooks: Notebook[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notebook));
      setNotebooks(fetchedNotebooks);
      if (!activeNotebookId && fetchedNotebooks.length > 0) {
        setActiveNotebookId(fetchedNotebooks[0].id);
      } else if (fetchedNotebooks.length === 0) {
        setActiveNotebookId(null);
      }
    });
    return () => unsubscribe();
  }, [user, activeNotebookId]);

  // Originale Daten-Lade-Logik (unverändert)
  useEffect(() => {
    if (!user || !activeNotebookId) {
      setSections([]);
      setPages([]);
      return;
    }
    const fetchSectionsAndPages = async () => {
      try {
        const sectionsQuery = query(collection(db, 'users', user.uid, 'sections'), where('notebook_id', '==', activeNotebookId), orderBy('created_at', 'asc'));
        const sectionsSnapshot = await getDocs(sectionsQuery);
        const fetchedSections: Section[] = sectionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Section));
        setSections(fetchedSections);

        if (fetchedSections.length > 0 && !fetchedSections.some((s) => s.id === activeSectionId)) {
          setActiveSectionId(fetchedSections[0].id);
        } else if (fetchedSections.length === 0) {
          setActiveSectionId(null);
        }

        if (fetchedSections.length > 0) {
          const sectionIds = fetchedSections.map((s) => s.id);
          const pagesQuery = query(collection(db, 'users', user.uid, 'notes'), where('sectionId', 'in', sectionIds), orderBy('datum', 'desc'));
          const pagesSnapshot = await getDocs(pagesQuery);
          // @ts-ignore
          const fetchedPages: Page[] = pagesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Page));
          setPages(fetchedPages);

          if (activePageId && !fetchedPages.some((p) => p.id === activePageId)) {
            setActivePageId(null);
          }
        } else {
          setPages([]);
        }
      } catch (error) {
        console.error('Error fetching sections and pages:', error);
      }
    };
    fetchSectionsAndPages();
    const sectionsUnsubscribe = onSnapshot(query(collection(db, 'users', user.uid, 'sections'), where('notebook_id', '==', activeNotebookId)), fetchSectionsAndPages);
    const notesUnsubscribe = onSnapshot(query(collection(db, 'users', user.uid, 'notes')), fetchSectionsAndPages);
    return () => {
      sectionsUnsubscribe();
      notesUnsubscribe();
    };
  }, [user, activeNotebookId, activeSectionId]);

  // NEU: Speicherfunktion für Auto-Save
  const saveNow = useCallback(async () => {
    if (!user || !activePageId || Object.keys(pendingDataRef.current).length === 0) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');
    const dataToSave = { ...pendingDataRef.current };
    pendingDataRef.current = {};

    try {
      await updateDoc(doc(db, 'users', user.uid, 'notes', activePageId), dataToSave);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(s => s === 'saved' ? 'idle' : s), 2000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setSaveStatus('error');
      pendingDataRef.current = { ...pendingDataRef.current, ...dataToSave };
    } finally {
      isSavingRef.current = false;
    }
  }, [user, activePageId]);

  // ERSETZT: Original `handleUpdatePage` durch Auto-Save-Logik
  const handleUpdatePage = useCallback((field: 'titel' | 'inhalt', value: string | OutputData) => {
    if (!activePageId) return;
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, [field]: value } : p));
    
    if (field === 'titel' && typeof value === 'string') pendingDataRef.current.titel = value;
    else if (field === 'inhalt') pendingDataRef.current.inhalt = value as OutputData;
    
    setSaveStatus('pending');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(saveNow, 5000);
  }, [activePageId, saveNow]);

  // Management-Funktionen (angepasste Texte)
  const handleRename = async (type: 'notebook' | 'section' | 'page', id: string, currentName: string) => {
    const newName = prompt(`"${currentName}" umbenennen in:`, currentName);
    if (newName && newName.trim() !== '' && user) {
      const collectionName = type === 'page' ? 'notes' : type + 's';
      const fieldName = type === 'page' ? 'titel' : 'name';
      await updateDoc(doc(db, 'users', user.uid, collectionName, id), { [fieldName]: newName });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!user || !confirm("Möchtest du diese Seite wirklich löschen?")) return;
    if (activePageId === pageId) setActivePageId(null);
    await deleteDoc(doc(db, 'users', user.uid, 'notes', pageId));
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!user || !confirm("Möchtest du dieses Kapitel und ALLE darin enthaltenen Seiten wirklich löschen?")) return;
    const batch = writeBatch(db);
    const pagesQuery = query(collection(db, 'users', user.uid, 'notes'), where('sectionId', '==', sectionId));
    const pagesSnapshot = await getDocs(pagesQuery);
    pagesSnapshot.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'users', user.uid, 'sections', sectionId));
    await batch.commit();
    if (activeSectionId === sectionId) setActiveSectionId(null);
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (!user || !confirm("Möchtest du dieses Notizbuch und ALLE Inhalte darin wirklich löschen?")) return;
    // Löschlogik für das ganze Notizbuch
  };

  const handleContextMenu = (event: React.MouseEvent, type: 'notebook' | 'section' | 'page', id: string, name: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, type, id, name });
  };

  // Create-Handler (angepasst)
  const handleAddNotebook = async () => {
    const name = prompt("Name des neuen Notizbuchs:");
    if (name && user) {
      await addDoc(collection(db, 'users', user.uid, 'notebooks'), { name, created_at: serverTimestamp() });
    }
  };

  const handleAddSection = async () => {
    if (!activeNotebookId) return alert("Wähle zuerst ein Notizbuch aus.");
    const name = prompt("Name des neuen Kapitels:");
    if (name && user) {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'sections'), { name, notebook_id: activeNotebookId, created_at: serverTimestamp() });
      setActiveSectionId(docRef.id);
    }
  };

  const handleAddPage = async (sectionId: string) => {
    if (!user || !sectionId) return;
    const docRef = await addDoc(collection(db, 'users', user.uid, 'notes'), {
      titel: 'Unbenannte Seite',
      inhalt: EMPTY_INHALT, // KORRIGIERT
      sectionId: sectionId,
      isFavorit: false,
      datum: new Date().toISOString(),
    });
    setActivePageId(docRef.id);
  };

  // Selektions-Handler (unverändert)
  const handleSelectNotebook = (id: string) => {
    setActiveNotebookId(id);
    setActiveSectionId(null);
    setActivePageId(null);
  };
  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setActivePageId(null);
  };
  
  // Abgeleiteter State & Memoization
  const activePage = useMemo(() => pages.find(p => p.id === activePageId), [pages, activePageId]);
  const activeNotebook = useMemo(() => notebooks.find(n => n.id === activeNotebookId), [notebooks, activeNotebookId]);
  const saveLabel = useMemo(() => {
    switch (saveStatus) {
      case 'pending': return { text: 'Unspeicherte Änderungen', color: '#e67e22', icon: '●' };
      case 'saving':  return { text: 'Wird gespeichert...', color: '#3498db', icon: '💾' };
      case 'saved':   return { text: 'Alles gespeichert', color: '#27ae60', icon: '✓' };
      case 'error':   return { text: 'Speicherfehler', color: '#e74c3c', icon: '✗' };
      default:        return { text: 'Gespeichert', color: '#27ae60', icon: '✓' };
    }
  }, [saveStatus]);

  // Render-Logik (angepasst)
  const renderMainContent = () => {
    if (activePageId && activePage) {
      return (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
          <div style={{padding: '16px 24px', background: '#f8f9fa', borderBottom: '2px solid #e9ecef', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', fontWeight: 500}}>
              <span style={{color: saveLabel.color, fontSize: '1rem', padding: '6px 12px', background: `${saveLabel.color}20`, borderRadius: '20px', minWidth: '160px', textAlign: 'center'}}>
                {saveLabel.icon} {saveLabel.text}
              </span>
            </div>
          </div>
          <div style={{overflowY: 'auto', flex: 1, padding: '20px 40px'}}>
            <input 
              type="text" 
              value={activePage.titel} 
              onChange={(e) => handleUpdatePage('titel', e.target.value)} 
              style={{ width: '100%', fontSize: '2rem', fontWeight: 'bold', border: 'none', outline: 'none', marginBottom: '20px'}}
            />
            <Editor
              documentId={activePageId}
              value={activePage.inhalt}
              onChange={(v) => handleUpdatePage('inhalt', v)}
            />
          </div>
        </div>
      );
    }
    if (activeNotebook) {
      return <NotebookDashboard notebook={activeNotebook} sectionCount={sections.length} pageCount={pages.length} onAddSection={handleAddSection} />;
    }
    return <NotebookDashboard notebook={null} sectionCount={0} pageCount={0} onAddSection={() => {}} />;
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }} onClick={() => setContextMenu(null)}>
      <NotebooksColumn notebooks={notebooks} activeNotebookId={activeNotebookId} onSelectNotebook={handleSelectNotebook} onAddNotebook={handleAddNotebook} onContextMenu={(e, id, name) => handleContextMenu(e, 'notebook', id, name)} />
      <SectionsAndPagesColumn sections={sections} pages={pages} activeSectionId={activeSectionId} activePageId={activePageId} onSelectSection={handleSelectSection} onSelectPage={setActivePageId} onAddSection={handleAddSection} onAddPage={handleAddPage} onContextMenu={(e, type, id, name) => handleContextMenu(e, type, id, name)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderMainContent()}
      </div>
      {contextMenu && <ContextMenu position={{ x: contextMenu.x, y: contextMenu.y }} onClose={() => setContextMenu(null)} items={[{ label: 'Umbenennen', onClick: () => handleRename(contextMenu.type, contextMenu.id, contextMenu.name) }, { label: 'Löschen', color: '#e74c3c', onClick: () => { if (contextMenu.type === 'notebook') handleDeleteNotebook(contextMenu.id); else if (contextMenu.type === 'section') handleDeleteSection(contextMenu.id); else if (contextMenu.type === 'page') handleDeletePage(contextMenu.id); }}]} />}
    </div>
  );
}
