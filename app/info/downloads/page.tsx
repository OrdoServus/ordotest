"use client";
import React from 'react';
import Link from 'next/link';

export default function DownloadsPage() {
  return (
    <div style={pageStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        <Link href="/info" style={backLink}>← Zurück zur Info-Seite</Link>
        <div style={{ fontWeight: 'bold' }}>OrdoServus Downloads</div>
      </nav>

      <div style={containerStyle}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>OrdoServus herunterladen</h1>
          <p style={{ color: '#666' }}>Wählen Sie Ihre Plattform und starten Sie mit der Organisation Ihrer liturgischen Dienste.</p>
        </header>

        <div style={gridStyle}>
          {/* Web App */}
          <div style={cardStyle}>
            <h3>🌐 Web-App</h3>
            <p>Verwenden Sie OrdoServus direkt in Ihrem Browser. Keine Installation erforderlich.</p>
            <Link href="/" style={buttonStyle('#2c3e50')}>
              Zur Web-App
            </Link>
          </div>

          {/* Placeholder for future downloads */}
          <div style={cardStyle}>
            <h3>📱 Mobile Apps</h3>
            <p>Mobile Apps für iOS und Android sind in Entwicklung. Bleiben Sie dran!</p>
            <button style={buttonStyle('#ccc')} disabled>
              Bald verfügbar
            </button>
          </div>

          <div style={cardStyle}>
            <h3>💻 Desktop-Versionen</h3>
            <p>Native Desktop-Apps für Windows, macOS und Linux werden vorbereitet.</p>
            <button style={buttonStyle('#ccc')} disabled>
              Bald verfügbar
            </button>
          </div>

          {/* Additional Resources */}
          <div style={cardStyle}>
            <h3>📄 Liturgische Vorlagen</h3>
            <p>Laden Sie vorgefertigte Vorlagen für Gottesdienste und Andachten herunter.</p>
            <button style={buttonStyle('#27ae60')} disabled>
              Download (PDF)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '60px', color: '#666' }}>
          <p>OrdoServus ist ein Open-Source-Projekt. Der Quellcode ist auf <a href="https://github.com/ordoservus/ordoservus" target="_blank" rel="noopener noreferrer" style={{ color: '#2c3e50' }}>GitHub</a> verfügbar.</p>
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
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '60px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center'
};

const buttonStyle = (color: string) => ({
  display: 'inline-block', padding: '10px 20px', backgroundColor: color, color: 'white',
  textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' as 'bold', marginTop: '10px', border: 'none', cursor: 'pointer'
});
