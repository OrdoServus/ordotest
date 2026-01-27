'use client';
import React from 'react';
import { Book, Folder, FileText } from 'lucide-react';

interface Notebook {
  id: string;
  name: string;
}

interface NotebookDashboardProps {
  notebook: Notebook | null;
  sectionCount: number;
  pageCount: number;
  onAddSection: () => void;
}

const NotebookDashboard: React.FC<NotebookDashboardProps> = ({ notebook, sectionCount, pageCount, onAddSection }) => {
  if (!notebook) {
    return (
      <div style={styles.container}>
        <div style={styles.placeholder}>
          <Book size={48} color="#bdc3c7" />
          <h2>Kein Notizbuch ausgewählt</h2>
          <p>Wählen Sie ein Notizbuch aus der Liste aus, um dessen Inhalt anzuzeigen.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{notebook.name}</h1>
        <p style={styles.subtitle}>Notizbuch-Übersicht</p>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
            <Folder size={24} color="#3498db" />
            <span style={styles.statValue}>{sectionCount}</span>
            <span style={styles.statLabel}>Kapitel</span>
        </div>
        <div style={styles.statBox}>
            <FileText size={24} color="#2ecc71" />
            <span style={styles.statValue}>{pageCount}</span>
            <span style={styles.statLabel}>Seiten</span>
        </div>
      </div>
      
      <div style={styles.actionsContainer}>
          <h3 style={styles.actionsTitle}>Schnellaktionen</h3>
          <button style={styles.actionButton} onClick={onAddSection}>
              Neues Kapitel erstellen
          </button>
      </div>

    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    flex: 1,
    padding: '40px',
    backgroundColor: '#fdfdfd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
  },
  placeholder: {
    textAlign: 'center',
    color: '#7f8c8d',
    margin: 'auto',
  },
  header: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#7f8c8d',
  },
  statsContainer: {
    display: 'flex',
    gap: '40px',
    marginBottom: '40px',
  },
  statBox: {
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '20px',
    minWidth: '150px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#34495e',
  },
  statLabel: {
    color: '#555',
    fontWeight: 500,
  },
  actionsContainer: {
      width: '100%',
      maxWidth: '800px',
      paddingTop: '20px',
      marginTop: '20px',
      borderTop: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
  },
  actionsTitle: {
      marginBottom: '20px',
      color: '#333',
      fontWeight: 600,
  },
  actionButton: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '1rem',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'background-color 0.2s',
  }
};


export default NotebookDashboard;
