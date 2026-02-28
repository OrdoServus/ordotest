'use client';
import React from 'react';
import Link from 'next/link';
import Footer from './Footer';

export default function InfoPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', lineHeight: '1.6' }}>
      
      {/* Navigation */}
      <nav style={navStyle}>
        <Link href="/" style={{ textDecoration: 'none', color: '#2c3e50' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>OrdoServus</div>
        </Link>
      </nav>

      {/* Hero Bereich */}
      <header style={heroStyle}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Dein digitaler Dienst am Altar & Schreibtisch</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 30px' }}>
          OrdoServus unterstützt dich als Pfarrer, Diakon oder liturgischen Dienst bei der Vorbereitung 
          deiner liturgischen Aufgaben und der Organisation deiner pastoralen Gedanken.
        </p>
        <Link href="/login">
          <button style={ctaButtonStyle}>Jetzt kostenlos starten</button>
        </Link>
      </header>

      {/* Navigation Cards */}
      <section style={cardsSectionStyle}>
          <Link href="/info/downloads" style={cardLinkStyle}><div style={cardStyle}><h3>Downloads</h3><p>Apps für all deine Geräte.</p></div></Link>
          <a href="https://github.com/ordoservus/ordoservus/wiki" target="_blank" rel="noopener noreferrer" style={cardLinkStyle}><div style={cardStyle}><h3>Hilfe</h3><p>Anleitungen und FAQs.</p></div></a>
          <Link href="/info/kontakt" style={cardLinkStyle}><div style={cardStyle}><h3>Kontakt</h3><p>Schreib uns.</p></div></Link>
      </section>

      {/* Features Sektion */}
      <section id="features" style={{ padding: '60px 20px', backgroundColor: '#fff' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px' }}>Entwickelt für deine Seelsorge</h2>
        <div style={featureGrid}>
          <div style={featureCard}>
            <h3>⛪ Liturgische Vorlagen</h3>
            <p>Strukturierte Abläufe für Messen, Andachten und Taufen. Kein "leeres Blatt" mehr bei deiner Vorbereitung.</p>
          </div>
          <div style={featureCard}>
            <h3>📓 Flexibles Notizbuch</h3>
            <p>Einfache Organisation wie in OneNote. Perfekt für deine Katechese, Predigtideen und Gremienarbeit.</p>
          </div>
          <div style={featureCard}>
            <h3>🔒 Privat & Lokal</h3>
            <p>Deine Daten gehören dir. OrdoServus speichert alles lokal in deinem Browser – ohne Cloud-Zwang.</p>
          </div>
        </div>
      </section>

      {/* Über das Projekt */}
      <section id="ueber" style={{ padding: '60px 20px', backgroundColor: '#f9f9f9' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px' }}>Die Vision</h2>
          <p>
            OrdoServus entstand aus unserer Idee, moderne Webtechnologie mit den Anforderungen deines kirchlichen Alltags zu verbinden. 
            Es ist ein Open-Source-Projekt, das einfach, schnell und unabhängig funktionieren soll. Wir glauben daran, dass 
            Technologie deine Seelsorge unterstützen kann, ohne Kompromisse bei Datenschutz und Benutzerfreundlichkeit einzugehen. 
            Dieses Produkt haben wir für dich entwickelt, damit du deinen Dienst am Altar und im pastoralen Alltag bestmöglich 
            gestalten kannst. Es steht dir kostenlos zur Verfügung.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// --- STYLES (Mobile-First) ---
const navStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '20px', backgroundColor: '#fff', borderBottom: '1px solid #eee'
};

const heroStyle: React.CSSProperties = {
  padding: '60px 20px', textAlign: 'center',
  background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)', color: 'white'
};

const ctaButtonStyle: React.CSSProperties = {
  padding: '12px 30px', fontSize: '1.1rem', backgroundColor: '#27ae60',
  color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold'
};

const cardsSectionStyle: React.CSSProperties = {
    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', padding: '40px 20px', backgroundColor: '#f9f9f9'
};

const cardLinkStyle: React.CSSProperties = {
    textDecoration: 'none', color: 'inherit', flex: '1 1 250px', maxWidth: '300px'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.2s',
};

const featureGrid: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '900px', margin: '0 auto'
};

const featureCard = {
  padding: '30px', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' as 'center'
};
