'use client';
import React from 'react';
import Link from 'next/link';
import Footer from '../../Footer';

export default function DatenschutzPage() {

  return (
    <div style={styles.page}>
        <nav style={styles.nav}>
            <Link href="/info" style={styles.backLink}>← Zurück zur Info-Seite</Link>
            <div style={{ fontWeight: 'bold' }}>Datenschutzerklärung</div>
        </nav>
        <main style={styles.main}>
            <header style={styles.header}>
                <h1>Datenschutzbestimmungen für OrdoServus</h1>
                <p><em>Stand: März 2026</em></p>
            </header>
            <section style={styles.content}>
                <div style={styles.section}>
                    <h2 style={styles.h2}>📌 1. Verantwortliche Stelle</h2>
                    <p>
                        Verantwortlich für die Datenbearbeitung ist:
                    </p>
                    <p>ordo.servus@gmx.ch</p>
                    <p>Bei Fragen zum Datenschutz jederzeit kontaktierbar.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🔍 2. Zweck der Datenbearbeitung</h2>
                    <p>OrdoServus unterstützt pastorale/liturgische Tätigkeiten. Datenverarbeitung für:</p>
                    <ul style={styles.ul}>
                        <li>Bereitstellung/Betrieb</li>
                        <li>Benutzerkonten-Verwaltung</li>
                        <li>Notizen/Vorlagen/Kalender</li>
                        <li>Fehleranalyse/Verbesserung</li>
                        <li>Sicherheit/Stabilität</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🧑‍💻 3. Erhobene Daten</h2>
                    <p><strong>3.1 Eingaben:</strong> Name, E-Mail, Notizbuch-Inhalte, Kalender, Vorlagen.</p>
                    <p><strong>3.2 Auto:</strong> IP, Browser, Datum/Uhrzeit, Gerät, Fehlerberichte.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>☁️ 4. Hosting/Dienste</h2>
                    <p><strong>Vercel:</strong> Hosting, IP/Logs. Server EU/USA. <a href="https://vercel.com/legal/datenschutzerklaerung" target="_blank">Vercel DSE</a></p>
                    <p><strong>Firebase (Google):</strong> Auth, Firestore. EU/USA, DSGVO-konform.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🔐 5. Sicherheit</h2>
                    <ul style={styles.ul}>
                        <li>HTTPS/TLS-Verschlüsselung</li>
                        <li>Firebase Server-Encryption</li>
                        <li>Kein Zugriff Dritter</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🛑 6. Keine Weitergabe</h2>
                    <p>Nur mit Zustimmung oder gesetzlich. Kein Marketing/Tracking.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🧽 7. Löschung</h2>
                    <p>Inhalte/Konto löschen → Daten entfernt (ausser gesetzlich).</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🧑‍⚖️ 8. Rechte (revDSG/DSGVO)</h2>
                    <p>Auskunft, Berichtigung, Löschung, Portabilität. Kontakt: ordo.servus@gmx.ch</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🍪 9. Cookies</h2>
                    <p>Nur technische (Login/Sicherheit). Kein Tracking.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🔗 10. Externe Links</h2>
                    <p>Keine Verantwortung für externe Datenschutz.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>🛠️ 11. Änderungen</h2>
                    <p>Aktuelle Version hier. Wesentliche Änderungen angekündigt.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>📬 12. Kontakt</h2>
                    <p>Siehe Kontaktseite</p>
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
  ul: {
    listStyle: 'disc',
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
};
