"use client";
import React from 'react';
import { ordoFileService } from './ordoFileSystem';
import WhatsNew from './WhatsNew';

interface NotizbuchSidebarProps {
  dokumente: any[];
  aktuelleId: string;
  onWähleDokument: (id: string) => void;
  onNeu: () => void;
  onLöschen: (id: string) => void;
  onImport: (doc: any) => void;
  onModusWechsel: (modus: string) => void;
}

export default function NotizbuchSidebar({ dokumente, aktuelleId, onWähleDokument, onNeu, onLöschen, onImport, onModusWechsel }: NotizbuchSidebarProps) {
  const gefilterteDocs = dokumente.filter((d: any) => d.typ === 'notizbuch');
  const aktuellesDoc = dokumente.find((d: any) => d.id === aktuelleId);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importiertesDoc = await ordoFileService.import(file);
        onImport(importiertesDoc);
        alert(`Erfolgreich importiert: ${importiertesDoc.titel}`);
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <aside style={{ width: '280px', backgroundColor: '#f3f3f3', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Links oben */}
      <div style={navStyle}>
        <button onClick={() => onModusWechsel('gottesdienst')} style={navLinkStyle(false)}>
          ⛪ Liturgie
        </button>
        <button onClick={() => onModusWechsel('notizbuch')} style={navLinkStyle(true)}>
          📓 Notizbuch
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: '20px', backgroundColor: '#80397B', color: 'white' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Digitales Notizbuch</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', opacity: 0.9 }}>
          Organisieren Sie Gedanken, Katechese und Verwaltungsnotizen im OneNote-Stil.
        </p>
        <button onClick={onNeu} style={neuButtonStyle}>
          + Neue Seite
        </button>
      </div>

      {/* Import Button */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #ddd' }}>
        <label style={importLabelStyle}>
          📁 Importieren
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Dokumente Liste */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {gefilterteDocs.map((doc: any) => (
          <div key={doc.id} style={{
            padding: '12px 20px',
            cursor: 'pointer',
            borderBottom: '1px solid #eee',
            backgroundColor: aktuelleId === doc.id ? '#fff' : 'transparent',
            borderLeft: aktuelleId === doc.id ? '5px solid #80397B' : '5px solid transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'background-color 0.2s ease'
          }}>
            <div onClick={() => onWähleDokument(doc.id)} style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{doc.titel || 'Unbenannt'}</div>
              <div style={{ fontSize: '0.7rem', color: '#999' }}>{doc.datum}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLöschen(doc.id);
              }}
              style={deleteButtonStyle}
              title="Löschen"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <div style={{ marginBottom: '5px' }}>
          <strong>OrdoServus</strong> – Notizbuch
        </div>
        <div>
          © {new Date().getFullYear()} · Made with ❤️
        </div>
        <div style={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
          <WhatsNew />
        </div>
      </div>
    </aside>
  );
}

// Styles
const navStyle: React.CSSProperties = {
  display: 'flex',
  backgroundColor: '#80397B',
  padding: '10px'
};

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px 12px',
  backgroundColor: active ? '#9c4d91' : 'transparent',
  color: 'white',
  fontSize: '0.85rem',
  fontWeight: '500',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px'
});

const neuButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: 'white',
  color: '#80397B',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '0.9rem'
};

const importLabelStyle: React.CSSProperties = {
  display: 'block',
  padding: '8px 12px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  textAlign: 'center',
  transition: 'background-color 0.2s ease'
};

const deleteButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.2rem',
  padding: '5px',
  opacity: 0.6,
  transition: 'opacity 0.2s'
};

const footerStyle: React.CSSProperties = {
  padding: '15px 20px',
  borderTop: '1px solid #ddd',
  backgroundColor: '#fafafa',
  fontSize: '0.7rem',
  color: '#666',
  textAlign: 'center'
};