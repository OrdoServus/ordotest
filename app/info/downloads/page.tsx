'use client';
import React from 'react';
import Link from 'next/link';

// A simple component for each download option
const DownloadOption = ({ title, icon, action, disabled = false, comingSoon = false }) => {
  return (
    <div style={styles.downloadOption}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.optionTitle}>{title}</h3>
      {comingSoon ? (
        <button style={styles.disabledButton} disabled>Bald verfügbar</button>
      ) : (
        action
      )}
    </div>
  );
};

export default function DownloadsPage() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/info" style={styles.backLink}>← Zurück zur Info-Seite</Link>
        <div style={{ fontWeight: 'bold' }}>OrdoServus Downloads</div>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1>OrdoServus herunterladen</h1>
          <p style={styles.subtitle}>
            Greifen Sie auf OrdoServus über unsere Web-App zu. Native Apps für Desktop und Mobile sind in Vorbereitung.
          </p>
        </header>

        {/* Web App Section */}
        <div style={styles.webAppCard}>
          <h2>🌐 Web-App</h2>
          <p>Nutzen Sie die volle Funktionalität von OrdoServus direkt im Browser. Keine Installation notwendig.</p>
          <Link href="/" style={styles.launchButton}>
            Web-App starten
          </Link>
        </div>

        {/* Desktop & Mobile Sections */}
        <div style={styles.appsGrid}>
          {/* Desktop */}
          <div style={styles.category}>
            <h2 style={styles.categoryTitle}>💻 Desktop</h2>
            <div style={styles.optionsContainer}>
              <DownloadOption title="Windows" icon="🪟" comingSoon />
              <DownloadOption title="macOS" icon="" comingSoon />
              <DownloadOption title="Linux" icon="🐧" comingSoon />
            </div>
          </div>

          {/* Mobile */}
          <div style={styles.category}>
            <h2 style={styles.categoryTitle}>📱 Mobile</h2>
            <div style={styles.optionsContainer}>
              <DownloadOption title="iOS" icon="iPhone" comingSoon />
              <DownloadOption title="Android" icon="Android" comingSoon />
            </div>
          </div>
        </div>

        <footer style={styles.footer}>
          <p>
            OrdoServus ist ein Open-Source-Projekt. Helfen Sie mit auf{' '}
            <a href="https://github.com/ordoservus/ordoservus" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>.
          </p>
        </footer>
      </main>
    </div>
  );
}


const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: 'sans-serif',
    backgroundColor: '#fff',
    minHeight: '100vh',
    color: '#2c3e50',
  },
  nav: {
    padding: '20px 50px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    textDecoration: 'none',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '50px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    maxWidth: '600px',
    margin: '10px auto 0',
  },
  webAppCard: {
    backgroundColor: '#f9f9fb',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    marginBottom: '50px',
  },
  launchButton: {
    display: 'inline-block',
    padding: '12px 25px',
    backgroundColor: '#ef5c22',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '20px',
  },

  appsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
  },
  category: {
    
  },
  categoryTitle: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '1.5rem',
      color: '#34495e',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  downloadOption: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f9f9fb',
    padding: '15px 20px',
    borderRadius: '10px',
    border: '1px solid #eee',
  },
  icon: {
    fontSize: '1.8rem',
    marginRight: '15px',
    width: '30px',
    textAlign: 'center',
  },
  optionTitle: {
    margin: 0,
    flexGrow: 1,
    fontSize: '1.1rem',
  },
  disabledButton: {
    padding: '8px 15px',
    backgroundColor: '#ecf0f1',
    color: '#bdc3c7',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center',
    marginTop: '60px',
    paddingTop: '30px',
    borderTop: '1px solid #eee',
    color: '#7f8c8d',
  }
};
