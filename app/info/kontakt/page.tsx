'use client';
import React, { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function KontaktPage() {
  const [status, setStatus] = useState({ submitting: false, success: false, error: '' });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: '' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Etwas ist schief gelaufen.');
      }

      setStatus({ submitting: false, success: true, error: '' });
      (e.target as HTMLFormElement).reset();

    } catch (error: any) {
      setStatus({ submitting: false, success: false, error: error.message });
    }
  };

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
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <input type="text" name="name" placeholder="Ihr Name" required style={inputStyle} />
              <input type="email" name="email" placeholder="Ihre E-Mail-Adresse" required style={inputStyle} />
              <textarea name="message" placeholder="Ihre Nachricht..." required style={textareaStyle}></textarea>
              <button type="submit" disabled={status.submitting} style={submitButtonStyle}>
                {status.submitting ? 'Wird gesendet...' : 'Nachricht senden'}
              </button>
            </form>
            {status.success && <p style={{ color: 'green', marginTop: '15px' }}>Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.</p>}
            {status.error && <p style={{ color: 'red', marginTop: '15px' }}>{status.error}</p>}
          </div>

          {/* Other Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={sideCardStyle}>
              <h4>🚀 Technischer Support</h4>
              <p>Fehler und Wünsche können Sie direkt auf GitHub melden.</p>
              <a href="https://github.com/ordoservus/ordoservus/issues" target="_blank" style={buttonStyle('#2c3e50')}>
                GitHub Issues
              </a>
            </div>
            <div style={sideCardStyle}>
              <h4>❓ Hilfe-Portal</h4>
              <p>Viele Antworten finden Sie bereits in unserem Hilfe-Bereich.</p>
              <a href="/info/help" style={buttonStyle('#ef5c22')}>
                Zur Hilfe
              </a>
            </div>
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

const contactGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
};

const formCardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
};

const sideCardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center'
};


const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box'
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: '120px',
  resize: 'vertical',
};

const submitButtonStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white',
  border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
};

const buttonStyle = (color: string) => ({
  display: 'inline-block', padding: '10px 20px', backgroundColor: color, color: 'white',
  textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' as 'bold', marginTop: '10px'
});
