'use client';
import React from 'react';
import Link from 'next/link';

export default function DatenschutzPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div style={styles.page}>
        <nav style={styles.nav}>
            <Link href="/info" style={styles.backLink}>← Zurück zur Info-Seite</Link>
            <div style={{ fontWeight: 'bold' }}>Datenschutzerklärung</div>
        </nav>
        <main style={styles.main}>
            <header style={styles.header}>
                <h1>Datenschutzerklärung</h1>
            </header>
            <section style={styles.content}>
                <div style={styles.section}>
                    <h2 style={styles.h2}>1. Verantwortliche Stelle</h2>
                    <p>
                        OrdoServus ist ein privates Open-Source-Projekt. Da es keine zentrale, kommerzielle Organisation gibt, 
                        liegt die Verantwortung für den Datenschutz bei der Person oder Gemeinschaft, die diese Software auf 
                        einem eigenen Server betreibt.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>2. Allgemeines zur Datenbearbeitung</h2>
                    <p>
                        Wir bearbeiten personenbezogene Daten im Einklang mit dem Schweizer
                        Datenschutzgesetz (revDSG). Die Nutzung unserer kostenlosen Web‑Software
                        ist grundsätzlich ohne Angabe personenbezogener Daten möglich. 
                        Soweit Daten erhoben werden, erfolgt dies nur im technisch notwendigen 
                        Umfang oder aufgrund Ihrer freiwilligen Angaben.
                    </p>
                </div>

                <div style={styles.section}>
                  <h2 style={styles.h2}>3. Erhebung und Zweck der Datenbearbeitung</h2>
                  <p>Wir bearbeiten personenbezogene Daten insbesondere für folgende Zwecke:</p>
                  <ul style={styles.ul}>
                    <li>Bereitstellung und Betrieb der Web‑Software</li>
                    <li>Kommunikation mit Nutzerinnen und Nutzern bei optionaler Account-Erstellung</li>
                    <li>Sicherstellung der Systemsicherheit und ‑stabilität</li>
                  </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>4. Server‑Log‑Daten</h2>
                    <p>
                        Beim Zugriff auf unsere Web‑Software werden automatisch technische Daten 
                        erfasst, darunter IP‑Adresse, Datum und Uhrzeit, Browsertyp und Betriebssystem. 
                        Diese Daten dienen der Sicherstellung des technischen Betriebs.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>5. Cookies und Lokaler Speicher</h2>
                    <p>
                        Unsere Web‑Software verwendet den lokalen Speicher (Local Storage) Ihres Browsers, 
                        um Ihre Dokumente und Einstellungen direkt auf Ihrem Gerät zu sichern. 
                        Es werden nur technisch notwendige Cookies für die Login-Funktion (Supabase) verwendet.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>6. Weitergabe von Daten</h2>
                    <p>
                        Eine Weitergabe personenbezogener Daten findet nicht statt. 
                        Wenn Sie die Cloud-Funktion nutzen, werden Ihre Daten verschlüsselt an 
                        Supabase übertragen, aber nicht an Dritte weitergegeben.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>7. Ihre Rechte</h2>
                    <p>Sie haben im Rahmen des revDSG insbesondere folgende Rechte:</p>
                    <ul style={styles.ul}>
                        <li>Auskunft über die bearbeiteten personenbezogenen Daten</li>
                        <li>Berichtigung unrichtiger Daten</li>
                        <li>Löschung Ihrer Daten (bei Nutzung der Cloud-Funktion in den Einstellungen möglich)</li>
                        <li>Widerspruch gegen bestimmte Datenbearbeitungen</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>8. Änderungen dieser Datenschutzerklärung</h2>
                    <p>
                        Wir behalten uns vor, diese Datenschutzerklärung jederzeit anzupassen. 
                        Es gilt die jeweils aktuelle Version, die in der Web‑Software abrufbar ist. <br/>
                        Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
                    </p>
                </div>
            </section>
        </main>
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
