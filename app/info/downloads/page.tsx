'use client';
import React from 'react';
import Link from 'next/link';
import Footer from '../Footer';

interface DownloadOptionProps {
  title: string;
  comingSoon?: boolean;
}

const DownloadOption = ({ title, comingSoon = false }: DownloadOptionProps) => {
  return (
    <div style={styles.downloadOption}>
      <h3 style={styles.optionTitle}>{title}</h3>
      {comingSoon && (
        <span style={styles.disabledButton}>Bald verfügbar</span>
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
          <h1 style={styles.pageTitle}>Lade OrdoServus herunter</h1>
          <p style={styles.subtitle}>
            Greife auf OrdoServus über unsere Web-App zu. Apps für Desktop und Mobilgeräte sind in Vorbereitung.
          </p>
        </header>

        {/* Web App Section */}
        <div style={styles.webAppCard}>
          <h2>Web-App</h2>
          <p>Nutze die volle Funktionalität von OrdoServus direkt im Browser. Keine Installation notwendig.</p>
          <Link href="/" style={styles.launchButton}>
            Web-App starten
          </Link>
        </div>

        {/* Desktop & Mobile Sections */}
        <div style={styles.appsContainer}>
          {/* Desktop */}
          <div style={styles.category}>
            <h2 style={styles.categoryTitle}>Desktop</h2>
            <div style={styles.optionsContainer}>
              <DownloadOption title="Windows" comingSoon />
              <DownloadOption title="macOS" comingSoon />
              <DownloadOption title="Linux" comingSoon />
            </div>
          </div>

          {/* Mobile */}
          <div style={styles.category}>
            <h2 style={styles.categoryTitle}>Mobil</h2>
            <div style={styles.optionsContainer}>
              <DownloadOption title="iOS" comingSoon />
              <DownloadOption title="Android" comingSoon />
            </div>
          </div>
        </div>
      </main>
      <Footer />
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
    padding: '20px',
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
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  pageTitle: {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 15px 0',
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
    padding: '30px',
    textAlign: 'center',
    marginBottom: '40px',
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
  appsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
  },
  category: {
    flex: '1 1 300px',
    minWidth: '280px',
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
    justifyContent: 'space-between',
    backgroundColor: '#f9f9fb',
    padding: '15px 20px',
    borderRadius: '10px',
    border: '1px solid #eee',
  },
  optionTitle: {
    margin: 0,
    fontSize: '1.1rem',
  },
  disabledButton: {
    padding: '8px 15px',
    backgroundColor: '#ecf0f1',
    color: '#bdc3c7',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};
