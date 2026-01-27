'use client';
import React from 'react';
import { Book, Plus } from 'lucide-react';

interface Notebook {
  id: string;
  name: string;
}

interface NotebooksColumnProps {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  onSelectNotebook: (id: string) => void;
  onAddNotebook: () => void;
  onContextMenu: (event: React.MouseEvent, id: string, name: string) => void;
}

const NotebooksColumn: React.FC<NotebooksColumnProps> = ({ 
  notebooks, 
  activeNotebookId, 
  onSelectNotebook, 
  onAddNotebook,
  onContextMenu
}) => {
  return (
    <div style={styles.columnContainer}>
      <div style={styles.header}>
        <h3>Notizbücher</h3>
        <button onClick={onAddNotebook} style={styles.iconButton} title="Neues Notizbuch">
          <Plus size={18} />
        </button>
      </div>
      <div style={styles.list}>
        {notebooks.map(notebook => (
          <div 
            key={notebook.id}
            style={activeNotebookId === notebook.id ? styles.itemActive : styles.item}
            onClick={() => onSelectNotebook(notebook.id)}
            onContextMenu={(e) => onContextMenu(e, notebook.id, notebook.name)}
          >
            <Book size={16} style={{flexShrink: 0}} />
            <span style={styles.itemName}>{notebook.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  columnContainer: {
    width: '220px',
    height: '100%',
    borderRight: '1px solid #e0e0e0',
    backgroundColor: '#f9f9f9',
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
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '4px',
  },
  itemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '4px',
    backgroundColor: '#e0e8ff',
    fontWeight: 500,
  },
  itemName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

export default NotebooksColumn;
