'use client';
import React from 'react';
import { Plus, Book, Folder, File } from 'lucide-react';

// TypeScript-Interfaces für die Daten
interface Notebook {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  notebookId: string;
}

interface Page {
  id: string;
  titel: string;
  sectionId: string;
}

// Props-Definition für die Sidebar
interface NotesSidebarProps {
  notebooks: Notebook[];
  sections: Section[];
  pages: Page[];
  activeNotebookId: string | null;
  activeSectionId: string | null;
  activePageId: string | null;
  onSelectNotebook: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectPage: (id: string) => void;
  onAddNotebook: () => void;
  onAddSection: () => void;
  onAddPage: (sectionId: string) => void;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notebooks,
  sections,
  pages,
  activeNotebookId,
  activeSectionId,
  activePageId,
  onSelectNotebook,
  onSelectSection,
  onSelectPage,
  onAddNotebook,
  onAddSection,
  onAddPage,
}) => {

  return (
    <div style={styles.sidebarContainer}>
      <div style={styles.header}>
        <h3>Notizbücher</h3>
        <button onClick={onAddNotebook} style={styles.iconButton} title="Neues Notizbuch erstellen">
          <Plus size={18} />
        </button>
      </div>
      
      {/* Notebook Selector */}
      <div style={styles.notebookSelector}>
        <Book size={16} style={{ color: '#555' }} />
        <select 
          style={styles.select}
          value={activeNotebookId || ''}
          onChange={(e) => onSelectNotebook(e.target.value)}
        >
          {notebooks.map(nb => <option key={nb.id} value={nb.id}>{nb.name}</option>)}
        </select>
      </div>

      <div style={styles.header2}>
        <h4>Kapitel</h4>
        <button onClick={onAddSection} style={styles.iconButton} title="Neues Kapitel erstellen">
          <Plus size={16} />
        </button>
      </div>

      {/* Sections and Pages List */}
      <div style={styles.sectionList}>
        {sections.map(section => (
          <div key={section.id}>
            <div 
              style={activeSectionId === section.id ? styles.sectionHeaderActive : styles.sectionHeader}
              onClick={() => onSelectSection(section.id)}
            >
              <Folder size={16} />
              <span style={styles.sectionTitle}>{section.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddPage(section.id); }}
                style={styles.iconButton}
                title="Neue Seite erstellen"
              >
                <Plus size={16}/>
              </button>
            </div>
            {activeSectionId === section.id && (
              <div style={styles.pageList}>
                {pages
                  .filter(p => p.sectionId === section.id)
                  .map(page => (
                    <div 
                      key={page.id} 
                      style={activePageId === page.id ? styles.pageItemActive : styles.pageItem}
                      onClick={() => onSelectPage(page.id)}
                    >
                      <File size={14} />
                      <span style={styles.pageTitle}>{page.titel}</span>
                    </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


const styles: { [key: string]: React.CSSProperties } = {
  sidebarContainer: {
    width: '300px',
    height: '100%',
    backgroundColor: '#f9f9f9',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0,
  },
  header2: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    background: '#f1f1f1',
    borderBottom: '1px solid #e0e0e0',
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#555',
    padding: '4px',
    borderRadius: '4px',
  },
  notebookSelector: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    gap: '8px',
    flexShrink: 0,
  },
  select: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    outline: 'none',
  },
  sectionList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  sectionHeaderActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: '#eef1f5',
  },
  sectionTitle: {
    flex: 1,
  },
  pageList: {
    paddingLeft: '20px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  pageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontSize: '0.9rem',
  },
  pageItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#e0e8ff',
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  pageTitle: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

export default NotesSidebar;
