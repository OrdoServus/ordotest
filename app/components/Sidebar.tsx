'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../AuthContext'; // Import useAuth to get profile info

// Define the expected props based on page.tsx
interface SidebarProps {
  dokumente: any[];
  aktuelleId: string | null;
  onWähleDokument: (id: string) => void;
  onNeu: () => void;
  onLöschen: (id: string) => void;
  onKopieren: (id: string) => void;
  onFavorit: (id: string) => void;
}

export default function Sidebar({ dokumente, aktuelleId, onWähleDokument, onNeu, onLöschen, onKopieren, onFavorit }: SidebarProps) {
  const { profile } = useAuth(); // Get user profile

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return '';
    return new Date(timestamp.toDate()).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <aside style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>OrdoServus</h3>
        <p style={styles.headerSubtitle}>Ihr liturgischer Assistent</p>
        <button onClick={onNeu} style={styles.neuButton}>
          + Neuer Dienst
        </button>
      </div>

      {/* Dokumente Liste */}
      <div style={styles.docList}>
        {dokumente.map((doc: any) => (
          <div 
            key={doc.id} 
            style={styles.docItem(aktuelleId === doc.id)}
          >
            <div style={styles.docItemInfo} onClick={() => onWähleDokument(doc.id)}>
              <div style={styles.docTitle}>{doc.titel || 'Unbenannt'}</div>
              <div style={styles.docDate}>{formatDate(doc.datum)}</div>
            </div>
            <div style={styles.docActions}>
              <button onClick={(e) => { e.stopPropagation(); onFavorit(doc.id); }} style={styles.actionButton} title="Favorit">{doc.isFavorit ? '⭐' : '☆'}</button>
              <button onClick={(e) => { e.stopPropagation(); onKopieren(doc.id); }} style={styles.actionButton} title="Kopieren">📄</button>
              <button onClick={(e) => { e.stopPropagation(); onLöschen(doc.id); }} style={styles.actionButton} title="Löschen">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer mit Profil & Einstellungen */}
      <div style={styles.footer}>
        <div style={styles.profileSection}>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{profile?.name || 'Benutzer'}</div>
            <div style={styles.profileFunction}>{profile?.funktion || 'Keine Funktion'}</div>
          </div>
          <Link href="/profile" style={styles.settingsButton} title="Einstellungen">
            ⚙️
          </Link>
        </div>
        <div style={styles.copyright}>
          © {new Date().getFullYear()} OrdoServus
        </div>
      </div>
    </aside>
  );
}

// Moderneres Styling
const styles = {
  sidebar: {
    width: '320px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #dee2e6',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  } as React.CSSProperties,
  header: {
    padding: '20px',
    backgroundColor: '#2c3e50',
    color: 'white'
  },
  headerTitle: {
    margin: '0 0 5px 0',
    fontSize: '1.2rem'
  },
  headerSubtitle: {
    margin: '0 0 15px 0',
    fontSize: '0.9rem',
    opacity: 0.8
  },
  neuButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    textAlign: 'center' as const
  },
  docList: {
    flex: 1,
    overflowY: 'auto' as const
  },
  docItem: (isActive: boolean) => ({
    padding: '12px 10px 12px 15px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    backgroundColor: isActive ? '#e9ecef' : 'transparent',
    borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s ease'
  }),
  docItemInfo: {
    flex: 1,
    paddingRight: '10px',
  },
  docTitle: {
    fontWeight: '500' as const,
    fontSize: '0.95rem',
    color: '#34495e',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  docDate: {
    fontSize: '0.8rem',
    color: '#7f8c8d',
    marginTop: '3px'
  },
  docActions: {
    display: 'flex',
    alignItems: 'center'
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '5px',
    opacity: 0.6,
    transition: 'opacity 0.2s, transform 0.2s'
  } as React.CSSProperties,
  footer: {
    padding: '15px 20px',
    borderTop: '1px solid #dee2e6',
    backgroundColor: '#f1f3f5'
  },
  profileSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  profileInfo: {},
  profileName: {
    fontWeight: 'bold' as const,
    color: '#2c3e50'
  },
  profileFunction: {
    fontSize: '0.85rem',
    color: '#7f8c8d'
  },
  settingsButton: {
    fontSize: '1.6rem',
    textDecoration: 'none' as const,
    color: '#5f6368',
    opacity: 0.8,
    transition: 'opacity 0.2s ease'
  },
  copyright: {
    fontSize: '0.75rem',
    color: '#9aa0a6',
    textAlign: 'center' as const
  }
};