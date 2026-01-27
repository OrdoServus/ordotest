'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../login/firebaseClient';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, getDocs, writeBatch } from "firebase/firestore";

import NotizEditor from '../components/NotizEditor'; // Geändert
import NotebooksColumn from '../components/NotebooksColumn';
import SectionsAndPagesColumn from '../components/SectionsAndPagesColumn';
import ContextMenu from '../components/ContextMenu';
import NotebookDashboard from '../components/NotebookDashboard';

// TypeScript-Interfaces
interface Notebook {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
}

interface Section {
  id: string;
  name: string;
  notebookId: string;
  userId: string;
  createdAt: any;
}

interface Page {
  id: string;
  titel: string;
  inhalt: string;
  sectionId: string;
  userId: string;
  isFavorit: boolean;
  datum: any;
}

type ContextMenuTarget = { x: number; y: number; type: 'notebook' | 'section' | 'page'; id: string; name: string; };

export default function NotizenPage() {
  const user = useMemo(() => ({ uid: 'test-user-id' }), []);

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pages, setPages] = useState<Page[]>([]);

  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);

  // Data fetching logic (unchanged)
  useEffect(() => {
    if (!user) return;
    const unsubNotebooks = onSnapshot(query(collection(db, 'users', user.uid, 'notebooks'), orderBy('createdAt', 'asc')), snapshot => {
        const fetchedNotebooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notebook));
        setNotebooks(fetchedNotebooks);
        if (!activeNotebookId && fetchedNotebooks.length > 0) {
            setActiveNotebookId(fetchedNotebooks[0].id);
        } else if (fetchedNotebooks.length === 0) {
            setActiveNotebookId(null);
        }
    });
    if (!activeNotebookId) {
        setSections([]);
        setPages([]);
        return () => unsubNotebooks();
    }
    let unsubPages: (() => void) | undefined;
    const unsubSections = onSnapshot(query(collection(db, 'users', user.uid, 'sections'), where('notebookId', '==', activeNotebookId), orderBy('createdAt', 'asc')), sectionSnapshot => {
        const fetchedSections = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
        setSections(fetchedSections);
        if (fetchedSections.length > 0 && !fetchedSections.some(s => s.id === activeSectionId)) {
            setActiveSectionId(fetchedSections[0].id);
        } else if (fetchedSections.length === 0) {
            setActiveSectionId(null);
        }
        if (unsubPages) unsubPages();
        const sectionIds = fetchedSections.map(s => s.id);
        if (sectionIds.length > 0) {
            unsubPages = onSnapshot(query(collection(db, 'users', user.uid, 'notes'), where('sectionId', 'in', sectionIds), orderBy('datum', 'desc')), pageSnapshot => {
                const fetchedPages = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
                setPages(fetchedPages);
                if (activePageId && !fetchedPages.some(p => p.id === activePageId)) {
                    setActivePageId(null);
                }
            });
        } else {
            setPages([]);
        }
    });
    return () => {
        unsubNotebooks();
        unsubSections();
        if (unsubPages) unsubPages();
    };
}, [user, activeNotebookId]);

  // Management functions (unchanged)
  const handleRename = async (type: 'notebook' | 'section' | 'page', id: string, currentName: string) => {
    const newName = prompt(`"${currentName}" umbenennen in:`, currentName);
    if (newName && newName.trim() !== '' && user) {
      let collectionName = type === 'notebook' ? 'notebooks' : type === 'section' ? 'sections' : 'notes';
      let fieldName = type === 'page' ? 'titel' : 'name';
      await updateDoc(doc(db, 'users', user.uid, collectionName, id), { [fieldName]: newName });
    }
  };
  const handleDeletePage = async (pageId: string) => {
    if (!user || !confirm("Soll diese Seite wirklich gelöscht werden?")) return;
    if (activePageId === pageId) setActivePageId(null);
    await deleteDoc(doc(db, 'users', user.uid, 'notes', pageId));
  };
  const handleDeleteSection = async (sectionId: string) => {
    if (!user || !confirm("Soll dieses Kapitel und ALLE darin enthaltenen Seiten wirklich gelöscht werden?")) return;
    const batch = writeBatch(db);
    const pagesQuery = query(collection(db, 'users', user.uid, 'notes'), where('sectionId', '==', sectionId));
    const pagesSnapshot = await getDocs(pagesQuery);
    pagesSnapshot.forEach(doc => batch.delete(doc.ref));
    batch.delete(doc(db, 'users', user.uid, 'sections', sectionId));
    await batch.commit();
    if (activeSectionId === sectionId) setActiveSectionId(null);
    setActivePageId(null);
  };
  const handleDeleteNotebook = async (notebookId: string) => {
    if (!user || !confirm("Soll dieses Notizbuch und ALLE darin enthaltenen Kapitel und Seiten wirklich gelöscht werden?")) return;
    const batch = writeBatch(db);
    const sectionsQuery = query(collection(db, 'users', user.uid, 'sections'), where('notebookId', '==', notebookId));
    const sectionsSnapshot = await getDocs(sectionsQuery);
    for (const sectionDoc of sectionsSnapshot.docs) {
        const pagesQuery = query(collection(db, 'users', user.uid, 'notes'), where('sectionId', '==', sectionDoc.id));
        const pagesSnapshot = await getDocs(pagesQuery);
        pagesSnapshot.forEach(pageDoc => batch.delete(pageDoc.ref));
        batch.delete(sectionDoc.ref);
    }
    batch.delete(doc(db, 'users', user.uid, 'notebooks', notebookId));
    await batch.commit();
    if (activeNotebookId === notebookId) setActiveNotebookId(null);
  };
  const handleContextMenu = (event: React.MouseEvent, type: 'notebook' | 'section' | 'page', id: string, name: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, type, id, name });
  };

  // Creation handlers (unchanged)
  const handleAddNotebook = async () => {
    const name = prompt("Name des neuen Notizbuchs:");
    if (name && user) {
      await addDoc(collection(db, 'users', user.uid, 'notebooks'), { name, userId: user.uid, createdAt: serverTimestamp() });
    }
  };
  const handleAddSection = async () => {
    if (!activeNotebookId) return alert("Wählen Sie ein Notizbuch aus.");
    const name = prompt("Name des neuen Kapitels:");
    if (name && user) {
      const newSectionRef = await addDoc(collection(db, 'users', user.uid, 'sections'), { name, notebookId: activeNotebookId, userId: user.uid, createdAt: serverTimestamp() });
      setActiveSectionId(newSectionRef.id);
    }
  };
  const handleAddPage = async (sectionId: string) => {
    if (!user || !sectionId) return;
    const newPageRef = await addDoc(collection(db, 'users', user.uid, 'notes'), {
      titel: 'Unbenannte Seite', inhalt: '# Neue Seite\n', sectionId: sectionId, userId: user.uid, isFavorit: false, datum: serverTimestamp(),
    });
    setActivePageId(newPageRef.id);
  };

  // Selection handlers (unchanged)
  const handleSelectNotebook = (id: string) => {
    setActiveNotebookId(id);
    setActiveSectionId(null);
    setActivePageId(null);
  };
  const handleSelectSection = (id: string) => {
      setActiveSectionId(id);
      setActivePageId(null);
  };
  const handleUpdatePage = useCallback(async (field: 'titel' | 'inhalt', value: string) => {
    if (!user || !activePageId) return;
    await updateDoc(doc(db, 'users', user.uid, 'notes', activePageId), { [field]: value });
  }, [user, activePageId]);

  // Derived state for rendering
  const activePage = pages.find(p => p.id === activePageId);
  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);

  const renderMainContent = () => {
    if (activePageId && activePage) {
      return (
        <NotizEditor // Geändert
          key={activePageId}
          titel={activePage.titel}
          inhalt={activePage.inhalt}
          onTitelChange={(w) => handleUpdatePage('titel', w)}
          onInhaltChange={(w) => handleUpdatePage('inhalt', w)}
          onSpeichern={() => {}}
          document={activePage as any}
        />
      );
    }
    if (activeNotebook) {
      return (
        <NotebookDashboard 
          notebook={activeNotebook}
          sectionCount={sections.length}
          pageCount={pages.length}
          onAddSection={handleAddSection}
        />
      );
    }
    return (
        <NotebookDashboard notebook={null} sectionCount={0} pageCount={0} onAddSection={() => {}} />
    );
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }} onClick={() => setContextMenu(null)}>
      <NotebooksColumn 
        notebooks={notebooks}
        activeNotebookId={activeNotebookId}
        onSelectNotebook={handleSelectNotebook}
        onAddNotebook={handleAddNotebook}
        onContextMenu={(e, id, name) => handleContextMenu(e, 'notebook', id, name)}
      />
      <SectionsAndPagesColumn
        sections={sections}
        pages={pages}
        activeSectionId={activeSectionId}
        activePageId={activePageId}
        onSelectSection={handleSelectSection}
        onSelectPage={setActivePageId}
        onAddSection={handleAddSection}
        onAddPage={handleAddPage}
        onContextMenu={(e, type, id, name) => handleContextMenu(e, type, id, name)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderMainContent()}
      </div>

      {contextMenu && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          items={[
            { label: 'Umbenennen', onClick: () => handleRename(contextMenu.type, contextMenu.id, contextMenu.name) },
            { label: 'Löschen', color: '#e74c3c', onClick: () => {
                if (contextMenu.type === 'notebook') handleDeleteNotebook(contextMenu.id);
                else if (contextMenu.type === 'section') handleDeleteSection(contextMenu.id);
                else if (contextMenu.type === 'page') handleDeletePage(contextMenu.id);
            }},
          ]}
        />
      )}
    </div>
  );
}
