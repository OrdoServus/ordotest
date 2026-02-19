'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, QueryDocumentSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from '../AuthContext';


import NotizEditor from '../components/NotizEditor';
import NotebooksColumn from '../components/NotebooksColumn';
import SectionsAndPagesColumn from '../components/SectionsAndPagesColumn';
import ContextMenu from '../components/ContextMenu';
import NotebookDashboard from '../components/NotebookDashboard';

// TypeScript-Interfaces
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

interface Page {
  id: string;
  titel: string;
  inhalt: string;
  sectionId: string;
  user_id: string;
  isFavorit: boolean;
  datum: any;
}


type ContextMenuTarget = { x: number; y: number; type: 'notebook' | 'section' | 'page'; id: string; name: string; };

export default function NotizenPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pages, setPages] = useState<Page[]>([]);

  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Data fetching logic
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'notebooks'),
          orderBy('created_at', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedNotebooks: Notebook[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          fetchedNotebooks.push({ id: doc.id, ...doc.data() } as Notebook);
        });
        setNotebooks(fetchedNotebooks);

        if (!activeNotebookId && fetchedNotebooks.length > 0) {
          setActiveNotebookId(fetchedNotebooks[0].id);
        } else if (fetchedNotebooks.length === 0) {
          setActiveNotebookId(null);
        }
      } catch (error) {
        console.error('Error fetching notebooks:', error);
      }
    };

    fetchData();

    // Subscribe to notebooks changes
    const q = query(
      collection(db, 'users', user.uid, 'notebooks'),
      orderBy('created_at', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const fetchedNotebooks: Notebook[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        fetchedNotebooks.push({ id: doc.id, ...doc.data() } as Notebook);
      });
      setNotebooks(fetchedNotebooks);
      
      if (!activeNotebookId && fetchedNotebooks.length > 0) {
        setActiveNotebookId(fetchedNotebooks[0].id);
      } else if (fetchedNotebooks.length === 0) {
        setActiveNotebookId(null);
      }
    });

    return () => unsubscribe();
  }, [user]);


  useEffect(() => {
    if (!user || !activeNotebookId) {
      setSections([]);
      setPages([]);
      return;
    }

    const fetchSectionsAndPages = async () => {
      try {
        // Fetch sections
        const sectionsQuery = query(
          collection(db, 'users', user.uid, 'sections'),
          where('notebook_id', '==', activeNotebookId),
          orderBy('created_at', 'asc')
        );
        const sectionsSnapshot = await getDocs(sectionsQuery);
        const fetchedSections: Section[] = [];
        sectionsSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          fetchedSections.push({ id: doc.id, ...doc.data() } as Section);
        });
        setSections(fetchedSections);

        if (fetchedSections.length > 0 && !fetchedSections.some((s) => s.id === activeSectionId)) {
          setActiveSectionId(fetchedSections[0].id);
        } else if (fetchedSections.length === 0) {
          setActiveSectionId(null);
        }

        // Fetch pages
        if (fetchedSections.length > 0) {
          const sectionIds = fetchedSections.map((s) => s.id);
        const pagesQuery = query(
          collection(db, 'users', user.uid, 'notes'),
          where('sectionId', 'in', sectionIds),
          orderBy('datum', 'desc')
        );

          const pagesSnapshot = await getDocs(pagesQuery);
          const fetchedPages: Page[] = [];
          pagesSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            fetchedPages.push({ id: doc.id, ...doc.data() } as Page);
          });
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

    // Subscribe to sections changes
    const sectionsQuery = query(
      collection(db, 'users', user.uid, 'sections'),
      where('notebook_id', '==', activeNotebookId),
      orderBy('created_at', 'asc')
    );
    const sectionsUnsubscribe = onSnapshot(sectionsQuery, () => {
      fetchSectionsAndPages();
    });

    // Subscribe to notes changes
    const notesQuery = query(
      collection(db, 'users', user.uid, 'notes'),
      orderBy('datum', 'desc')
    );
    const notesUnsubscribe = onSnapshot(notesQuery, () => {
      fetchSectionsAndPages();
    });

    return () => {
      sectionsUnsubscribe();
      notesUnsubscribe();
    };
  }, [user, activeNotebookId, activeSectionId]);


  // Management functions
  const handleRename = async (type: 'notebook' | 'section' | 'page', id: string, currentName: string) => {
    const newName = prompt(`"${currentName}" umbenennen in:`, currentName);
    if (newName && newName.trim() !== '' && user) {
      let collectionName = type === 'notebook' ? 'notebooks' : type === 'section' ? 'sections' : 'notes';
      let fieldName = type === 'page' ? 'titel' : 'name';
      
      try {
        const docRef = doc(db, 'users', user.uid, collectionName, id);
        await updateDoc(docRef, { [fieldName]: newName });
      } catch (error) {
        console.error('Error renaming:', error);
      }
    }
  };


  const handleDeletePage = async (pageId: string) => {
    if (!user || !confirm("Soll diese Seite wirklich gelöscht werden?")) return;
    if (activePageId === pageId) setActivePageId(null);
    
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', pageId));
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };


  const handleDeleteSection = async (sectionId: string) => {
    if (!user || !confirm("Soll dieses Kapitel und ALLE darin enthaltenen Seiten wirklich gelöscht werden?")) return;
    
    try {
      // Delete all pages in section
      const pagesQuery = query(
        collection(db, 'users', user.uid, 'notes'),
        where('sectionId', '==', sectionId)
      );

      const pagesSnapshot = await getDocs(pagesQuery);
      const deletePromises: Promise<void>[] = [];
      pagesSnapshot.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
        deletePromises.push(deleteDoc(doc(db, 'users', user.uid, 'notes', d.id)));
      });
      await Promise.all(deletePromises);

      // Delete section
      await deleteDoc(doc(db, 'users', user.uid, 'sections', sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
    }
    
    if (activeSectionId === sectionId) setActiveSectionId(null);
    setActivePageId(null);
  };


  const handleDeleteNotebook = async (notebookId: string) => {
    if (!user || !confirm("Soll dieses Notizbuch und ALLE darin enthaltenen Kapitel und Seiten wirklich gelöscht werden?")) return;
    
    try {
      // Get all sections in notebook
      const sectionsQuery = query(
        collection(db, 'users', user.uid, 'sections'),
        where('notebook_id', '==', notebookId)
      );
      const sectionsSnapshot = await getDocs(sectionsQuery);
      const sectionIds: string[] = [];
      sectionsSnapshot.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
        sectionIds.push(d.id);
      });

      // Delete all pages in those sections
      if (sectionIds.length > 0) {
        const pagesQuery = query(
          collection(db, 'users', user.uid, 'notes'),
          where('sectionId', 'in', sectionIds)
        );

        const pagesSnapshot = await getDocs(pagesQuery);
        const deletePagePromises: Promise<void>[] = [];
        pagesSnapshot.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
          deletePagePromises.push(deleteDoc(doc(db, 'users', user.uid, 'notes', d.id)));
        });
        await Promise.all(deletePagePromises);
      }

      // Delete all sections
      const deleteSectionPromises: Promise<void>[] = [];
      sectionsSnapshot.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
        deleteSectionPromises.push(deleteDoc(doc(db, 'users', user.uid, 'sections', d.id)));
      });
      await Promise.all(deleteSectionPromises);

      // Delete notebook
      await deleteDoc(doc(db, 'users', user.uid, 'notebooks', notebookId));
    } catch (error) {
      console.error('Error deleting notebook:', error);
    }
    
    if (activeNotebookId === notebookId) setActiveNotebookId(null);
  };

  const handleContextMenu = (event: React.MouseEvent, type: 'notebook' | 'section' | 'page', id: string, name: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, type, id, name });
  };

  // Creation handlers
  const handleAddNotebook = async () => {
    const name = prompt("Name des neuen Notizbuchs:");
    if (name && user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'notebooks'), {
          name,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error creating notebook:', error);
      }
    }
  };


  const handleAddSection = async () => {
    if (!activeNotebookId) return alert("Wählen Sie ein Notizbuch aus.");
    const name = prompt("Name des neuen Kapitels:");
    if (name && user) {
      try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'sections'), {
          name,
          notebook_id: activeNotebookId,
          created_at: new Date().toISOString()
        });
        setActiveSectionId(docRef.id);
      } catch (error) {
        console.error('Error creating section:', error);
      }
    }
  };


  const handleAddPage = async (sectionId: string) => {
    if (!user || !sectionId) return;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'notes'), {
        titel: 'Unbenannte Seite',
        inhalt: '# Neue Seite\n',
        sectionId: sectionId,
        isFavorit: false,
        datum: new Date().toISOString(),
      });

      setActivePageId(docRef.id);
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };


  // Selection handlers
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
    try {
      const docRef = doc(db, 'users', user.uid, 'notes', activePageId);
      await updateDoc(docRef, { [field]: value });
    } catch (error) {
      console.error('Error updating page:', error);
    }
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
