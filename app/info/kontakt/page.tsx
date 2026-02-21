'use client';
import React from 'react';
import Link from 'next/link';
import Footer from '../Footer';

export default function KontaktPage() {
  return (
    <div style={pageStyle}>
      <nav style={navStyle}>
        <Link href="/info" style={backLink}>← Zurück zur Info-Seite</Link>
        <div style={{ fontWeight: 'bold' }}>OrdoServus Kontakt</div>
      </nav>

      <div style={containerStyle}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>Kontakt & Support</h1>
          <p style={{ color: '#666' }}>Haben Sie Fragen, Anregungen oder benötigen Sie technische Hilfe?</p>
        </header>

        <div style={contactGrid}>
          {/* Contact Form */}
          <div style={formCardStyle}>
            <h3>Schreiben Sie uns direkt</h3>
            <p>Wir freuen uns auf Ihre Nachricht und melden uns schnellstmöglich bei Ihnen.</p>
            <form action="https://formspree.io/f/xwvlynzn" method="POST" style={{ marginTop: '20px' }}>
              <input type="text" name="name" placeholder="Ihr Name" required style={inputStyle} />
              <input type="email" name="email" placeholder="Ihre E-Mail-Adresse" required style={inputStyle} />
              <textarea name="message" placeholder="Ihre Nachricht..." required style={textareaStyle}></textarea>
              <button type="submit" style={submitButtonStyle}>
                Nachricht senden
              </button>
            </form>
             <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '15px', textAlign: 'center' }}>Powered by Formspree</p>
          </div>

          {/* Other Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={sideCardStyle}>
              <h4>🚀 Technischer Support & Hilfe</h4>
              <p>Fehler, Wünsche und Antworten auf Ihre Fragen finden Sie auf GitHub.</p>
              <a href="https://github.com/ordoservus/ordoservus/issues" target="_blank" style={buttonStyle('#2c3e50')}>
                GitHub Issues
              </a>
               <a href="https://github.com/ordoservus/ordoservus/wiki" target="_blank" style={buttonStyle('#ef5c22')}>
                Hilfe & Dokumentation
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// --- STYLES (Mobile-First Update) ---
const pageStyle: React.CSSProperties = {
  fontFamily: 'sans-serif', backgroundColor: '#f9f9fb', minHeight: '100vh'
};

const navStyle: React.CSSProperties = {
  padding: '20px', backgroundColor: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const backLink = { textDecoration: 'none', color: '#2c3e50', fontWeight: 'bold' as 'bold' };

const containerStyle: React.CSSProperties = {
  maxWidth: '900px', margin: '0 auto', padding: '40px 20px'
};

const contactGrid: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
};

const formCardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', order: 1
};

const sideCardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', order: 2
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'sans-serif'
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: '120px',
  resize: 'vertical',
};

const submitButtonStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white',
  border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif'
};

const buttonStyle = (color: string) => ({
  display: 'inline-block', padding: '10px 20px', backgroundColor: color, color: 'white',
  textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' as 'bold', marginTop: '10px'
});
