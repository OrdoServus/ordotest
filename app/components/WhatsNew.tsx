import { useState } from 'react';

export default function WhatsNew() {
  const [isOpen, setIsOpen] = useState(false);

  // Hier trägst du immer die neuesten 2-3 Punkte ein
  const updates = [
    { title: "Cloud-Sync", desc: "Sichere deine Texte jetzt via Supabase." },
    { title: ".ordo Dateien", desc: "Speichere Entwürfe direkt auf deinem PC." },
    { title: "Umlaute-Fix", desc: "Dateinamen mit Ä, Ö, Ü funktionieren jetzt." }
  ];

  return (
    <div style={{ marginTop: '5px' }}>
      <span 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: '#666',
          cursor: 'pointer',
          fontSize: '0.7rem'
        }}
      >
        Was ist neu?
      </span>

      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '20px',
          width: '250px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          padding: '15px',
          zIndex: 100
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Neuerungen v1.0</h4>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {updates.map((upd, i) => (
              <li key={i} style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                <strong>{upd.title}:</strong> {upd.desc}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ border: 'none', background: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
          >
            Schliessen
          </button>
        </div>
      )}
    </div>
  );
}