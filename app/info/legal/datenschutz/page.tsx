'use client';
import React from 'react';
import InfoLayout from '../../InfoLayout';
import { colors, fontSizes, sharedStyles } from '../../theme';

export default function DatenschutzPage() {
  return (
    <InfoLayout title="Datenschutzerklärung" backHref="/info">
      <header style={sharedStyles.pageHeader}>
        <h1 style={sharedStyles.h1}>Datenschutzerklärung</h1>
        <p style={{ fontSize: fontSizes.base, color: colors.textMuted, textAlign: 'center' }}>
          <em>Stand: März 2026</em>
        </p>
      </header>

      <section style={sharedStyles.contentCard}>
        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>📌 1. Verantwortliche Stelle</h2>
          <p>Verantwortlich für die Datenbearbeitung ist:</p>
          <p style={{ fontWeight: 'bold', fontSize: fontSizes.md }}>ordo.servus@gmx.ch</p>
          <p>Bei Fragen zum Datenschutz jederzeit kontaktierbar.</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🔍 2. Zweck der Datenbearbeitung</h2>
          <p>OrdoServus unterstützt pastorale/liturgische Tätigkeiten. Datenverarbeitung für:</p>
          <ul style={sharedStyles.ul}>
            <li>Bereitstellung/Betrieb</li>
            <li>Benutzerkonten-Verwaltung</li>
            <li>Notizen/Vorlagen/Kalender</li>
            <li>Fehleranalyse/Verbesserung</li>
            <li>Sicherheit/Stabilität</li>
          </ul>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🧑‍💻 3. Erhobene Daten</h2>
          <p><strong>3.1 Eingaben:</strong> Name, E-Mail, Notizbuch-Inhalte, Kalender, Vorlagen.</p>
          <p><strong>3.2 Auto:</strong> IP, Browser, Datum/Uhrzeit, Gerät, Fehlerberichte.</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>☁️ 4. Hosting/Dienste</h2>
          <p>
            <strong>Vercel:</strong> Hosting, IP/Logs. Server EU/USA.{' '}
            <a href="https://vercel.com/legal/datenschutzerklaerung" target="_blank" rel="noopener noreferrer"
              style={{ color: colors.accent }}>Vercel DSE</a>
          </p>
          <p><strong>Firebase (Google):</strong> Auth, Firestore. EU/USA, DSGVO-konform.</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🔐 5. Sicherheit</h2>
          <ul style={sharedStyles.ul}>
            <li>HTTPS/TLS-Verschlüsselung</li>
            <li>Firebase Server-Encryption</li>
            <li>Kein Zugriff Dritter</li>
          </ul>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🛑 6. Keine Weitergabe</h2>
          <p>Nur mit Zustimmung oder gesetzlich. Kein Marketing/Tracking.</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🧽 7. Löschung</h2>
          <p>Inhalte/Konto löschen → Daten entfernt (ausser gesetzlich).</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🧑‍⚖️ 8. Rechte (revDSG/DSGVO)</h2>
          <p>Auskunft, Berichtigung, Löschung, Portabilität. Kontakt: ordo.servus@gmx.ch</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🍪 9. Cookies</h2>
          <p>Nur technische (Login/Sicherheit). Kein Tracking.</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🔗 10. Externe Links</h2>
          <p>Keine Verantwortung für externe Datenschutz.</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>🛠️ 11. Änderungen</h2>
          <p>Aktuelle Version hier. Wesentliche Änderungen angekündigt.</p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>📬 12. Kontakt</h2>
          <p>Siehe Kontaktseite</p>
        </div>
      </section>
    </InfoLayout>
  );
}