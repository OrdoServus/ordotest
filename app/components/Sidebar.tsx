"use client";
import React from 'react';
import Link from 'next/link';
import { ordoFileService } from './ordoFileSystem';
import WhatsNew from './WhatsNew';
import NotizbuchSidebar from './NotizbuchSidebar';

export default function Sidebar({ modus, onModusWechsel, dokumente, aktuelleId, onWähleDokument, onNeu, onLöschen, onImport }: any) {
  // Wenn Notizbuch-Modus, verwende die spezielle NotizbuchSidebar
  if (modus === 'notizbuch') {
    return (
      <NotizbuchSidebar
        dokumente={dokumente}
        aktuelleId={aktuelleId}
        onWähleDokument={onWähleDokument}
        onNeu={onNeu}
        onLöschen={onLöschen}
        onImport={onImport}
        onModusWechsel={onModusWechsel}
      />
    );
  }

  // Ansonsten normale Sidebar für Liturgie
  const gefilterteDocs = dokumente.filter((d: any) => d.typ === modus);
  const aktuellesDoc = dokumente.find((d: any) => d.id === aktuelleId);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importiertesDoc = await ordoFileService.import(file);
        // Hier dein State-Update:
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
        <button onClick={() => onModusWechsel('gottesdienst')} style={navLinkStyle(modus === 'gottesdienst')}>
          ⛪ Liturgie
        </button>
        <button onClick={() => onModusWechsel('notizbuch')} style={navLinkStyle(modus === 'notizbuch')}>
          📓 Notizbuch
        </button>
      </div>

      {/* Header für Liturgie */}
      <div style={{ padding: '20px', backgroundColor: '#2c3e50', color: 'white' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Gottesdienst-Planer</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', opacity: 0.9 }}>
          Erstellen Sie Abläufe, Predigten und liturgische Texte mit Vorlagen.
        </p>
        <button onClick={onNeu} style={neuButtonStyle}>
          + Neuer Dienst
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
            padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid #eee',
            backgroundColor: aktuelleId === doc.id ? '#fff' : 'transparent',
            borderLeft: aktuelleId === doc.id ? `5px solid ${modus === 'notizbuch' ? '#80397B' : '#2c3e50'}` : '5px solid transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
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
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '5px',
                opacity: 0.6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              title="Löschen"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Footer mit Copyright */}
      <div style={{
        padding: '15px 20px',
        borderTop: '1px solid #ddd',
        backgroundColor: '#fafafa',
        fontSize: '0.7rem',
        color: '#666',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '5px' }}>
          <strong>OrdoServus</strong> – Liturgie
        </div>
        <div>
          © {new Date().getFullYear()} · Made with ❤️
        </div>
        <div style={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
          <WhatsNew />
          <a href="https://github.com/ordoservus/ordoservus" target="_blank" rel="noopener noreferrer">
            <img src="https://github.githubassets.com/images/modules/site/icons/footer/github-mark.svg" alt="GitHub" style={{ width: '20px', height: '20px' }} />
          </a>
        </div>
      </div>
    </aside>
  );
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  backgroundColor: '#2c3e50',
  padding: '10px'
};

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px 12px',
  border: 'none',
  backgroundColor: active ? '#34495e' : 'transparent',
  color: 'white',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '500',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px'
});

const neuButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: 'white',
  color: '#2c3e50',
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