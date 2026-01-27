'use client';
import React from 'react';
import { Plus, Folder, File } from 'lucide-react';

// Interfaces für die Daten
interface Section {
  id: string;
  name: string;
}

interface Page {
  id: string;
  titel: string;
  sectionId: string;
}

// Props-Definition
interface SectionsAndPagesColumnProps {
  sections: Section[];
  pages: Page[];
  activeSectionId: string | null;
  activePageId: string | null;
  onSelectSection: (id: string) => void;
  onSelectPage: (id: string) => void;
  onAddSection: () => void;
  onAddPage: (sectionId: string) => void;
  onContextMenu: (event: React.MouseEvent, type: 'section' | 'page', id: string, name: string) => void;
}

const SectionsAndPagesColumn: React.FC<SectionsAndPagesColumnProps> = ({
  sections,
  pages,
  activeSectionId,
  activePageId,
  onSelectSection,
  onSelectPage,
  onAddSection,
  onAddPage,
  onContextMenu
}) => {

  return (
    <div style={styles.columnContainer}>
      <div style={styles.header}>
        <h3>Kapitel & Seiten</h3>
        <button onClick={onAddSection} style={styles.iconButton} title="Neues Kapitel erstellen">
          <Plus size={18} />
        </button>
      </div>
      
      <div style={styles.list}>
        {sections.map(section => (
          <div key={section.id}>
            {/* Kapitel-Header */}
            <div 
              style={activeSectionId === section.id ? styles.sectionHeaderActive : styles.sectionHeader}
              onClick={() => onSelectSection(section.id)}
              onContextMenu={(e) => onContextMenu(e, 'section', section.id, section.name)}
            >
              <Folder size={16} />
              <span style={styles.sectionTitle}>{section.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddPage(section.id); }}
                style={styles.iconButton}
                title="Neue Seite in diesem Kapitel erstellen"
              >
                <Plus size={16}/>
              </button>
            </div>

            {/* Seiten-Liste für dieses Kapitel */}
            <div style={styles.pageList}>
              {pages
                .filter(p => p.sectionId === section.id)
                .map(page => (
                  <div 
                    key={page.id} 
                    style={activePageId === page.id ? styles.pageItemActive : styles.pageItem}
                    onClick={() => onSelectPage(page.id)}
                    onContextMenu={(e) => onContextMenu(e, 'page', page.id, page.titel)}
                  >
                    <File size={14} />
                    <span style={styles.pageTitle}>{page.titel}</span>
                  </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
    columnContainer: {
        width: '280px',
        minWidth: '280px',
        height: '100%',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0,
    },
    iconButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#555',
        padding: '4px',
        borderRadius: '4px',
    },
    list: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: 500,
        cursor: 'pointer',
        marginBottom: '4px',
    },
    sectionHeaderActive: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: 500,
        cursor: 'pointer',
        backgroundColor: '#eef1f5',
        marginBottom: '4px',
    },
    sectionTitle: {
        flex: 1,
    },
    pageList: {
        paddingLeft: '20px',
        marginBottom: '10px',
    },
    pageItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
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

export default SectionsAndPagesColumn;
