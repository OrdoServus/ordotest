"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard({ onModusWechsel, onNeu, dokumente }: any) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Zeige das Modal beim ersten Laden
    setShowLoginModal(true);
  }, []);

  const liturgienCount = dokumente.filter((d: any) => d.typ === 'gottesdienst').length;
  const notizenCount = dokumente.filter((d: any) => d.typ === 'notizbuch').length;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>Willkommen bei OrdoServus</h1>
            <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>Was möchten Sie heute tun?</p>
          </div>
          <Link href="/login" style={headerLoginButtonStyle}>
            🔐 Anmelden
          </Link>
        </div>
      </header>

      <div style={bannerStyle}>
        Information: Diese Anwendung ist in der ALPHA-Phase! <a href="/info" style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'none' }}>Mehr erfahren</a>
      </div>

      <div style={gridStyle}>
        {/* Karte 1: Liturgie */}
        <div 
          onClick={() => onModusWechsel('gottesdienst')}
          style={{ ...cardStyle, borderTop: '8px solid #2c3e50' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⛪</div>
          <h2 style={{ color: '#2c3e50' }}>Gottesdienst-Planer</h2>
          <p style={pStyle}>Erstellen Sie Abläufe, Predigten und liturgische Texte mit Vorlagen.</p>
          <span style={badgeStyle}>{liturgienCount} Entwürfe</span>
          <button onClick={(e) => { e.stopPropagation(); onModusWechsel('gottesdienst'); onNeu(); }} style={btnStyle('#2c3e50')}>
            + Neu erstellen
          </button>
        </div>

        {/* Karte 2: Notizbuch */}
        <div 
          onClick={() => onModusWechsel('notizbuch')}
          style={{ ...cardStyle, borderTop: '8px solid #80397B' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📓</div>
          <h2 style={{ color: '#80397B' }}>Digitales Notizbuch</h2>
          <p style={pStyle}>Organisieren Sie Gedanken, Katechese und Verwaltungsnotizen im OneNote-Stil.</p>
          <span style={badgeStyle}>{notizenCount} Seiten</span>
          <button onClick={(e) => { e.stopPropagation(); onModusWechsel('notizbuch'); onNeu(); }} style={btnStyle('#80397B')}>
            + Neue Notiz
          </button>
        </div>
      </div>

      <footer style={footerStyle}>
        <p>Zuletzt bearbeitet: {dokumente[0]?.titel || 'Keine Dokumente vorhanden'}</p>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <button
              onClick={() => setShowLoginModal(false)}
              style={closeButtonStyle}
            >
              ×
            </button>
            <h2 style={modalTitleStyle}>Willkommen bei OrdoServus</h2>
            <p style={modalTextStyle}>
              Wir empfehlen Ihnen, sich anzumelden. Daher werden Ihre Daten sicher in der Cloud gespeichert und sind von überall zugänglich.
            </p>
            <Link href="/login" style={loginButtonStyle}>
              Jetzt anmelden
            </Link>
            <button
              onClick={() => setShowLoginModal(false)}
              style={skipButtonStyle}
            >
              Später
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  flex: 1, padding: '60px', backgroundColor: '#f9f9fb',
  display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const newHeaderStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '20px' };

const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '50px' };

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

const footerStyle: React.CSSProperties = { marginTop: 'auto', color: '#bdc3c7', fontSize: '0.9rem' };

const bannerStyle: React.CSSProperties = {
  backgroundColor: '#e8f4fd',
  border: '1px solid #b3d9ff',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '30px',
  textAlign: 'center',
  color: '#2c3e50',
  fontSize: '1rem'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '15px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center',
  position: 'relative'
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  right: '15px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666'
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: '1.8rem',
  color: '#2c3e50',
  marginBottom: '15px'
};

const modalTextStyle: React.CSSProperties = {
  color: '#666',
  lineHeight: '1.5',
  marginBottom: '25px'
};

const loginButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#2c3e50',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold',
  marginBottom: '15px'
};

const skipButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #ccc',
  padding: '10px 20px',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#666'
};

const headerContentStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '20px'
};

const headerLoginButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  backgroundColor: '#2c3e50',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: '500',
  fontSize: '0.95rem',
  transition: 'background-color 0.3s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};