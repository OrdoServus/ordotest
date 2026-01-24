'use client';
import React from 'react';
import Link from 'next/link';

export default function InfoPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', lineHeight: '1.6' }}>
      
      {/* Navigation */}
      <nav style={navStyle}>
        <Link href="/" style={{ textDecoration: 'none', color: '#2c3e50' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>OrdoServus</div>
        </Link>
        {/* Nav links can be hidden on mobile or handled with a menu button */}
      </nav>

      {/* Hero Bereich */}
      <header style={heroStyle}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Digitaler Dienst am Altar & Schreibtisch</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 30px' }}>
          OrdoServus unterstützt Pfarrer, Diakone und liturgische Dienste bei der Vorbereitung 
          von Gottesdiensten und der Organisation pastoraler Gedanken.
        </p>
        <Link href="/login">
          <button style={ctaButtonStyle}>Jetzt Kostenlos Starten</button>
        </Link>
      </header>

      {/* Navigation Cards */}
      <section style={cardsSectionStyle}>
          <Link href="/info/downloads" style={cardLinkStyle}><div style={cardStyle}><h3>Downloads</h3><p>Apps für alle Geräte.</p></div></Link>
          <Link href="/info/help" style={cardLinkStyle}><div style={cardStyle}><h3>Hilfe</h3><p>Anleitungen und FAQs.</p></div></Link>
          <Link href="/info/kontakt" style={cardLinkStyle}><div style={cardStyle}><h3>Kontakt</h3><p>Schreiben Sie uns.</p></div></Link>
      </section>

      {/* Features Sektion */}
      <section id="features" style={{ padding: '60px 20px', backgroundColor: '#fff' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px' }}>Entwickelt für die Seelsorge</h2>
        <div style={featureGrid}>
          <div style={featureCard}>
            <h3>⛪ Liturgische Vorlagen</h3>
            <p>Strukturierte Abläufe für Messen, Andachten und Taufen. Kein "leeres Blatt" mehr bei der Vorbereitung.</p>
          </div>
          <div style={featureCard}>
            <h3>📓 Flexibles Notizbuch</h3>
            <p>Einfache Organisation wie in OneNote. Perfekt für Katechese, Predigtideen und Gremienarbeit.</p>
          </div>
          <div style={featureCard}>
            <h3>🔒 Privat & Lokal</h3>
            <p>Ihre Daten gehören Ihnen. OrdoServus speichert alles lokal in Ihrem Browser – ohne Cloud-Zwang.</p>
          </div>
        </div>
      </section>

      {/* Über das Projekt */}
      <section id="ueber" style={{ padding: '60px 20px', backgroundColor: '#f9f9f9' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px' }}>Die Vision</h2>
          <p>
            OrdoServus entstand aus der Idee, moderne Webtechnologie mit den Anforderungen 
            des kirchlichen Alltags zu verbinden. Es ist ein Open-Source-Projekt, das 
            einfach, schnell und unabhängig funktionieren soll. Wir glauben daran, dass 
            Technologie die Seelsorge unterstützen kann, ohne Kompromisse bei Datenschutz 
            und Benutzerfreundlichkeit einzugehen. Dieses Produkt ist für alle, die ihren 
            Dienst am Altar und im pastoralen Alltag bestmöglich gestalten möchten und steht Ihnen 
            kostenlos zur Verfügung.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <p>© {new Date().getFullYear()} OrdoServus – Open Source Projekt</p>
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/info/legal/impressum" style={footerLinkStyle}>Impressum</Link>
          <Link href="/info/legal/datenschutz" style={footerLinkStyle}>Datenschutz</Link>
          <Link href="/info/legal/lizenz" style={footerLinkStyle}>Lizenz</Link>
          <a href="https://github.com/ordoservus/ordoservus" target="_blank" rel="noopener noreferrer" style={footerLinkStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </footer>
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

const footerStyle: React.CSSProperties = {
  padding: '40px 20px', textAlign: 'center', backgroundColor: '#2c3e50', color: 'white'
};

const footerLinkStyle: React.CSSProperties = {
    color: '#aaa', margin: '5px 10px', textDecoration: 'none'
};