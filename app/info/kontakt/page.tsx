"use client";
import React from 'react';
import Link from 'next/link';

export default function KontaktPage() {
  return (
    <div style={pageStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        <Link href="/info" style={backLink}>← Zurück zur Info-Seite</Link>
        <div style={{ fontWeight: 'bold' }}>OrdoServus Kontakt</div>
      </nav>

      <div style={containerStyle}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>Kontakt & Support</h1>
          <p style={{ color: '#666' }}>Haben Sie Fragen, Anregungen oder benötigen Sie technische Hilfe?</p>
        </header>

        <div style={gridStyle}>
          {/* Support Optionen */}
          <div style={cardStyle}>
            <h3>🚀 Technischer Support</h3>
            <p>Da OrdoServus ein Open-Source-Projekt ist, verwalten wir Fehler und Wünsche öffentlich auf GitHub.</p>
            <a 
              href="https://github.com/ordoservus/ordoservus/issues" 
              target="_blank" 
              style={buttonStyle('#2c3e50')}
            >
              Fehler auf GitHub melden
            </a>
          </div>

          <div style={cardStyle}>
            <h3>📧 Direktkontakt</h3>
            <p>Für allgemeine Anfragen oder Feedback können Sie mir gerne eine E-Mail schreiben.</p>
            <a href="mailto:florian@my.mail.ch" style={buttonStyle('#27ae60')}>
              E-Mail senden
            </a>
          </div>

          <div style={cardStyle}>
            <h3>❓ Hilfe</h3>
            <p>Bitte schauen Sie auch in unserem Hilfe-Portal vorbei.</p>
            <a href="/info/help" style={buttonStyle('#ef5c22')}>
              Hilfe-Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const pageStyle: React.CSSProperties = {
  fontFamily: 'sans-serif', backgroundColor: '#f9f9fb', minHeight: '100vh'
};

const navStyle: React.CSSProperties = {
  padding: '20px 50px', backgroundColor: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'
};

const backLink = { textDecoration: 'none', color: '#2c3e50', fontWeight: 'bold' as 'bold' };

const containerStyle: React.CSSProperties = {
  maxWidth: '900px', margin: '0 auto', padding: '60px 20px'
};

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '60px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center'
};

const buttonStyle = (color: string) => ({
  display: 'inline-block', padding: '10px 20px', backgroundColor: color, color: 'white', 
  textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' as 'bold', marginTop: '10px'
});