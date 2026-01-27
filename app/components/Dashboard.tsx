"use client";
import React from 'react';
import Link from 'next/link';

// TypeScript-Interfaces für Typensicherheit
interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

interface DashboardProps {
  dokumente: Dokument[];
  onNeuGottesdienst: () => void;
  onNeuNotiz: () => void;
  // onWähleDokument ist nützlich, wenn wir eine Liste der letzten Dokumente anzeigen
  // onWähleDokument: (id: string) => void;
}

export default function Dashboard({ dokumente, onNeuGottesdienst, onNeuNotiz }: DashboardProps) {

  const liturgienCount = dokumente.filter((d) => d.typ === 'gottesdienst').length;
  const notizenCount = dokumente.filter((d) => d.typ === 'notiz').length;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>Willkommen bei OrdoServus</h1>
          <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>Was möchten Sie heute tun?</p>
        </div>
      </header>

      <div style={bannerStyle}>
        Information: Diese Anwendung ist in der ALPHA-Phase! <a href="/info" style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'none' }}>Mehr erfahren</a>
      </div>

      <div style={gridStyle}>
        {/* Karte 1: Liturgie */}
        <div 
          onClick={onNeuGottesdienst}
          style={{ ...cardStyle, borderTop: '8px solid #2c3e50' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⛪</div>
          <h2 style={{ color: '#2c3e50' }}>Gottesdienst-Planer</h2>
          <p style={pStyle}>Erstellen Sie Abläufe, Predigten und liturgische Texte mit Vorlagen.</p>
          <span style={badgeStyle}>{liturgienCount} Entwürfe</span>
          <button onClick={(e) => { e.stopPropagation(); onNeuGottesdienst(); }} style={btnStyle('#2c3e50')}>
            + Neu erstellen
          </button>
        </div>

        {/* Karte 2: Notizbuch */}
        <div 
          onClick={onNeuNotiz}
          style={{ ...cardStyle, borderTop: '8px solid #80397B' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📓</div>
          <h2 style={{ color: '#80397B' }}>Digitales Notizbuch</h2>
          <p style={pStyle}>Organisieren Sie Gedanken, Katechese und Verwaltungsnotizen im OneNote-Stil.</p>
          <span style={badgeStyle}>{notizenCount} Seiten</span>
          <button onClick={(e) => { e.stopPropagation(); onNeuNotiz(); }} style={btnStyle('#80397B')}>
            + Neue Notiz
          </button>
        </div>
      </div>

      <footer style={footerStyle}>
        <p>Zuletzt bearbeitet: {dokumente[0]?.titel || 'Keine Dokumente vorhanden'}</p>
      </footer>
    </div>
  );
}

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  flex: 1, padding: '60px', backgroundColor: '#f9f9fb',
  display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '50px', width: '100%' };

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '30px', width: '100%', maxWidth: '1000px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '40px', borderRadius: '15px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)', cursor: 'pointer',
  transition: 'transform 0.2s, boxShadow 0.2s', textAlign: 'center' as 'center',
  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
};

const pStyle = { color: '#666', lineHeight: '1.5', marginBottom: '20px' };

const badgeStyle = { 
  display: 'inline-block', padding: '5px 15px', backgroundColor: '#f0f2f5', 
  borderRadius: '20px', fontSize: '0.85rem', color: '#555', marginBottom: '20px' 
};

const btnStyle = (color: string) => ({
  backgroundColor: color, color: 'white', border: 'none', 
  padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as 'bold'
});

const footerStyle: React.CSSProperties = { marginTop: 'auto', paddingTop: '40px', color: '#bdc3c7', fontSize: '0.9rem' };

const bannerStyle: React.CSSProperties = {
  backgroundColor: '#e8f4fd',
  border: '1px solid #b3d9ff',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '30px',
  textAlign: 'center',
  color: '#2c3e50',
  fontSize: '1rem',
  width: '100%',
  maxWidth: '1000px'
};