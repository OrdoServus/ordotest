'use client';
import React from 'react';
import Link from 'next/link';
import Footer from '../../Footer';

export default function ImpressumPage() {
  return (
    <div style={styles.page}>
        <nav style={styles.nav}>
            <Link href="/info" style={styles.backLink}>← Zurück zur Info-Seite</Link>
            <div style={{ fontWeight: 'bold' }}>Impressum</div>
        </nav>
        <main style={styles.main}>
            <header style={styles.header}>
                <h1>Impressum</h1>
            </header>
            <section style={styles.content}>
                <div style={styles.section}>
                    <h2 style={styles.h2}>Verantwortung</h2>
                    <p>
                        OrdoServus ist ein nicht-kommerzielles Open-Source-Projekt.
                        Die Verantwortung für auf einem Server betriebene Instanzen liegt bei dir, wenn du den Server administrierst.
                    </p>
                     <p style={{ marginTop: 10 }}>
                        Das Projekt wird auf GitHub von einer Gemeinschaft von Freiwilligen entwickelt. 
                        Fehler, Anregungen oder Beiträge kannst du dort einreichen.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>Haftungsausschluss</h2>
                    <p>
                        Die Nutzung der Software erfolgt auf eigene Gefahr. Es wird keine Gewähr für die 
                        Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Funktionen und Inhalte übernommen.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>Urheberrecht</h2>
                    <p>
                        Der Quellcode von OrdoServus ist unter der MIT-Lizenz veröffentlicht. 
                        Die Inhalte und Strukturen der Software sind urheberrechtlich geschützt, soweit nicht anders angegeben.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>Datenschutz</h2>
                    <p>
                        Informationen zur Verarbeitung deiner personenbezogenen Daten findest du in der{" "}
                        <Link href="/info/legal/datenschutz" style={{ color: '#ef5c22', textDecoration: 'underline' }}>
                            Datenschutzerklärung
                        </Link>.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>Kontakt</h2>
                    <p>
                        Bei Fragen zum Projekt kannst du über GitHub oder die auf der Kontakt-Seite 
                        angegebenen Wege mit den Entwicklern in Verbindung treten.
                    </p>
                </div>
            </section>
        </main>
        <Footer />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: 'sans-serif',
    backgroundColor: '#f9f9fb',
    minHeight: '100vh',
    color: '#333',
  },
  nav: {
    padding: '20px',
    backgroundColor: '#fff',
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    fontSize: '1.8rem',
  },
  content: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    border: '1px solid #eee',
    lineHeight: 1.7,
  },
  section: {
    marginBottom: '30px',
  },
  h2: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2c3e50',
  },
};
