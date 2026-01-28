'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../login/supabaseClient';
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
  section_id: string;
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
      // Fetch notebooks
      const { data: notebooksData } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const fetchedNotebooks = notebooksData || [];
      setNotebooks(fetchedNotebooks as Notebook[]);

      if (!activeNotebookId && fetchedNotebooks.length > 0) {
        setActiveNotebookId(fetchedNotebooks[0].id);
      } else if (fetchedNotebooks.length === 0) {
        setActiveNotebookId(null);
      }
    };

    fetchData();

    // Subscribe to notebooks changes
    const notebooksSubscription = supabase
      .channel('notebooks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notebooks', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      notebooksSubscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user || !activeNotebookId) {
      setSections([]);
      setPages([]);
      return;
    }

    const fetchSectionsAndPages = async () => {
      // Fetch sections
      const { data: sectionsData } = await supabase
        .from('sections')
        .select('*')
        .eq('notebook_id', activeNotebookId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const fetchedSections = sectionsData || [];
      setSections(fetchedSections as Section[]);

      if (fetchedSections.length > 0 && !fetchedSections.some((s: any) => s.id === activeSectionId)) {
        setActiveSectionId(fetchedSections[0].id);
      } else if (fetchedSections.length === 0) {
        setActiveSectionId(null);
      }

      // Fetch pages
      if (fetchedSections.length > 0) {
        const sectionIds = fetchedSections.map((s: any) => s.id);
        const { data: pagesData } = await supabase
          .from('notes')
          .select('*')
          .in('section_id', sectionIds)
          .order('datum', { ascending: false });

        const fetchedPages = pagesData || [];
        setPages(fetchedPages as Page[]);

        if (activePageId && !fetchedPages.some((p: any) => p.id === activePageId)) {
          setActivePageId(null);
        }
      } else {
        setPages([]);
      }
    };

    fetchSectionsAndPages();

    // Subscribe to sections changes
    const sectionsSubscription = supabase
      .channel('sections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections', filter: `notebook_id=eq.${activeNotebookId}` }, () => {
        fetchSectionsAndPages();
      })
      .subscribe();

    // Subscribe to notes changes
    const notesSubscription = supabase
      .channel('notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        fetchSectionsAndPages();
      })
      .subscribe();

    return () => {
      sectionsSubscription.unsubscribe();
      notesSubscription.unsubscribe();
    };
  }, [user, activeNotebookId, activeSectionId]);

  // Management functions
  const handleRename = async (type: 'notebook' | 'section' | 'page', id: string, currentName: string) => {
    const newName = prompt(`"${currentName}" umbenennen in:`, currentName);
    if (newName && newName.trim() !== '' && user) {
      let tableName = type === 'notebook' ? 'notebooks' : type === 'section' ? 'sections' : 'notes';
      let fieldName = type === 'page' ? 'titel' : 'name';
      
      const { error } = await supabase
        .from(tableName)
        .update({ [fieldName]: newName })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) console.error('Error renaming:', error);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!user || !confirm("Soll diese Seite wirklich gelöscht werden?")) return;
    if (activePageId === pageId) setActivePageId(null);
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', pageId)
      .eq('user_id', user.id);

    if (error) console.error('Error deleting page:', error);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!user || !confirm("Soll dieses Kapitel und ALLE darin enthaltenen Seiten wirklich gelöscht werden?")) return;
    
    // Delete all pages in section
    const { error: pageError } = await supabase
      .from('notes')
      .delete()
      .eq('section_id', sectionId)
      .eq('user_id', user.id);

    // Delete section
    const { error: sectionError } = await supabase
      .from('sections')
      .delete()
      .eq('id', sectionId)
      .eq('user_id', user.id);

    if (pageError) console.error('Error deleting pages:', pageError);
    if (sectionError) console.error('Error deleting section:', sectionError);
    
    if (activeSectionId === sectionId) setActiveSectionId(null);
    setActivePageId(null);
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (!user || !confirm("Soll dieses Notizbuch und ALLE darin enthaltenen Kapitel und Seiten wirklich gelöscht werden?")) return;
    
    // Get all sections in notebook
    const { data: sections } = await supabase
      .from('sections')
      .select('id')
      .eq('notebook_id', notebookId)
      .eq('user_id', user.id);

    // Delete all pages in those sections
    if (sections && sections.length > 0) {
      const sectionIds = sections.map((s: any) => s.id);
      const { error: pageError } = await supabase
        .from('notes')
        .delete()
        .in('section_id', sectionIds);

      if (pageError) console.error('Error deleting pages:', pageError);
    }

    // Delete all sections
    const { error: sectionsError } = await supabase
      .from('sections')
      .delete()
      .eq('notebook_id', notebookId)
      .eq('user_id', user.id);

    // Delete notebook
    const { error: notebookError } = await supabase
      .from('notebooks')
      .delete()
      .eq('id', notebookId)
      .eq('user_id', user.id);

    if (sectionsError) console.error('Error deleting sections:', sectionsError);
    if (notebookError) console.error('Error deleting notebook:', notebookError);
    
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
      const { error } = await supabase
        .from('notebooks')
        .insert([{ name, user_id: user.id, created_at: new Date().toISOString() }]);

      if (error) console.error('Error creating notebook:', error);
    }
  };

  const handleAddSection = async () => {
    if (!activeNotebookId) return alert("Wählen Sie ein Notizbuch aus.");
    const name = prompt("Name des neuen Kapitels:");
    if (name && user) {
      const { data, error } = await supabase
        .from('sections')
        .insert([{ name, notebook_id: activeNotebookId, user_id: user.id, created_at: new Date().toISOString() }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating section:', error);
      } else if (data) {
        setActiveSectionId(data.id);
      }
    }
  };

  const handleAddPage = async (sectionId: string) => {
    if (!user || !sectionId) return;
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        titel: 'Unbenannte Seite',
        inhalt: '# Neue Seite\n',
        section_id: sectionId,
        user_id: user.id,
        isFavorit: false,
        datum: new Date().toISOString(),
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating page:', error);
    } else if (data) {
      setActivePageId(data.id);
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
    const { error } = await supabase
      .from('notes')
      .update({ [field]: value })
      .eq('id', activePageId)
      .eq('user_id', user.id);

    if (error) console.error('Error updating page:', error);
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

