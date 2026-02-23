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
                <h1>Datenschutzerklärung</h1>
            </header>
            <section style={styles.content}>
                <div style={styles.section}>
                    <h2 style={styles.h2}>1. Verantwortliche Stelle</h2>
                    <p>
                        OrdoServus ist ein privates Open-Source-Projekt. Die Verantwortung für den Datenschutz liegt bei dir, 
                        wenn du diese Software auf einem eigenen Server betreibst.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>2. Allgemeines zur Datenverarbeitung</h2>
                    <p>
                        Deine personenbezogenen Daten werden im Einklang mit dem Schweizer Datenschutzgesetz (revDSG) verarbeitet.
                        Du kannst die Web-Software grundsätzlich ohne Angabe personenbezogener Daten nutzen. 
                        Wenn Daten erhoben werden, erfolgt dies nur im technisch notwendigen Umfang oder aufgrund deiner freiwilligen Angaben.
                    </p>
                </div>

                <div style={styles.section}>
                  <h2 style={styles.h2}>3. Erhebung und Zweck der Datenverarbeitung</h2>
                  <p>Personenbezogene Daten werden insbesondere für folgende Zwecke verarbeitet:</p>
                  <ul style={styles.ul}>
                    <li>Bereitstellung und Betrieb der Web-Software</li>
                    <li>Kommunikation mit dir bei optionaler Account-Erstellung</li>
                    <li>Sicherstellung der Systemsicherheit und -stabilität</li>
                  </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>4. Server-Log-Daten</h2>
                    <p>
                        Beim Zugriff auf die Web-Software werden automatisch technische Daten 
                        erfasst, darunter deine IP-Adresse, Datum und Uhrzeit, Browsertyp und Betriebssystem. 
                        Diese Daten dienen der Sicherstellung des technischen Betriebs.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>5. Cookies und Lokaler Speicher</h2>
                    <p>
                        Die Web-Software verwendet den lokalen Speicher (Local Storage) deines Browsers, 
                        um deine Dokumente und Einstellungen direkt auf deinem Gerät zu sichern. 
                        Es werden nur technisch notwendige Cookies für die Login-Funktion (Supabase) verwendet.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>6. Weitergabe von Daten</h2>
                    <p>
                        Eine Weitergabe deiner personenbezogenen Daten findet nicht statt. 
                        Wenn du die Cloud-Funktion nutzt, werden deine Daten verschlüsselt an 
                        Supabase übertragen, aber nicht an Dritte weitergegeben.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>7. Deine Rechte</h2>
                    <p>Du hast im Rahmen des revDSG insbesondere folgende Rechte:</p>
                    <ul style={styles.ul}>
                        <li>Auskunft über die verarbeiteten personenbezogenen Daten</li>
                        <li>Berichtigung unrichtiger Daten</li>
                        <li>Löschung deiner Daten (bei Nutzung der Cloud-Funktion in den Einstellungen möglich)</li>
                        <li>Widerspruch gegen bestimmte Datenverarbeitungen</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>8. Änderungen dieser Datenschutzerklärung</h2>
                    <p>
                        Diese Datenschutzerklärung kann jederzeit angepasst werden. 
                        Es gilt die jeweils aktuelle Version, die in der Web-Software abrufbar ist. <br/>
                        Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
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
  ul: {
    listStyle: 'disc',
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
};
