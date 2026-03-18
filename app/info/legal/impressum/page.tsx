'use client';
import React from 'react';
import Link from 'next/link';
import InfoLayout from '../../InfoLayout';
import { colors, sharedStyles } from '../../theme';

export default function ImpressumPage() {
  return (
    <InfoLayout title="Impressum" backHref="/info">
      <header style={sharedStyles.pageHeader}>
        <h1 style={sharedStyles.h1}>Impressum</h1>
      </header>

      <section style={sharedStyles.contentCard}>
        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>Verantwortung</h2>
          <p>
            OrdoServus ist ein nicht-kommerzielles Open-Source-Projekt.
            Es wird von einer Gemeinschaft von Freiwilligen entwickelt und gepflegt, die sich der Unterstützung
            pastoraler und liturgischer Tätigkeiten verschrieben haben.
            Für Kontakt und weitere Informationen siehe die Kontakt-Seite.
          </p>
          <p style={{ marginTop: 10 }}>
            Das Projekt wird auf GitHub von einer Gemeinschaft von Freiwilligen entwickelt.
            Fehler, Anregungen oder Beiträge kannst du dort einreichen.
          </p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>Haftungsausschluss</h2>
          <p>
            Die Nutzung der Software erfolgt auf eigene Gefahr. Es wird keine Gewähr für die
            Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Funktionen und Inhalte übernommen.
          </p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>Urheberrecht</h2>
          <p>
            Der Quellcode von OrdoServus ist unter der MIT-Lizenz veröffentlicht.
            Die Inhalte und Strukturen der Software sind urheberrechtlich geschützt, soweit nicht anders angegeben.
          </p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>Datenschutz</h2>
          <p>
            Informationen zur Verarbeitung deiner personenbezogenen Daten findest du in der{' '}
            <Link href="/info/legal/datenschutz" style={{ color: colors.accent, textDecoration: 'underline' }}>
              Datenschutzerklärung
            </Link>.
          </p>
        </div>

        <div style={sharedStyles.section}>
          <h2 style={sharedStyles.h2}>Kontakt</h2>
          <p>
            Bei Fragen zum Projekt kannst du über GitHub oder die auf der Kontakt-Seite
            angegebenen Wege mit den Entwicklern in Verbindung treten.
          </p>
        </div>
      </section>
    </InfoLayout>
  );
}