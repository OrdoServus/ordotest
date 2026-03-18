'use client';
import React from 'react';
import InfoLayout from '../InfoLayout';
import { colors, fontSizes, spacing, sharedStyles } from '../theme';

export default function KontaktPage() {
  return (
    <InfoLayout title="OrdoServus Kontakt">
      <header style={sharedStyles.pageHeader}>
        <h1 style={sharedStyles.h1}>Kontakt & Support</h1>
        <p style={sharedStyles.subtitle}>Hast du Fragen, Anregungen oder brauchst du technische Hilfe?</p>
      </header>

      <div style={contactGridStyle}>
        {/* Contact Form */}
        <div style={sharedStyles.contentCardShadow}>
          <h3>Schreib uns direkt</h3>
          <p>Wir freuen uns auf deine Nachricht und melden uns schnellstmöglich bei dir.</p>
          <form action="https://formspree.io/f/xwvlynzn" method="POST" style={{ marginTop: spacing.md }}>
            <input type="text" name="name" placeholder="Dein Name" required style={sharedStyles.input} />
            <input type="email" name="email" placeholder="Deine E-Mail-Adresse" required style={sharedStyles.input} />
            <textarea name="message" placeholder="Deine Nachricht..." required style={sharedStyles.textarea} />
            <button type="submit" style={sharedStyles.buttonGreen}>
              Nachricht senden
            </button>
          </form>
          <p style={{ fontSize: fontSizes.xs, color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }}>
            Powered by Formspree
          </p>
        </div>

        {/* Side options */}
        <div style={sharedStyles.contentCardShadow}>
          <h4>🚀 Technischer Support & Hilfe</h4>
          <p>Fehler, Wünsche und Antworten auf deine Fragen findest du auf GitHub.</p>
          <a href="https://github.com/ordoservus/ordoservus/issues" target="_blank" rel="noopener noreferrer"
            style={{ ...sharedStyles.buttonDark, display: 'inline-block' }}>
            GitHub Issues
          </a>
          <a href="https://github.com/ordoservus/ordoservus/wiki" target="_blank" rel="noopener noreferrer"
            style={{ ...sharedStyles.buttonPrimary, display: 'inline-block', marginLeft: spacing.sm }}>
            Hilfe & Dokumentation
          </a>
        </div>
      </div>
    </InfoLayout>
  );
}

const contactGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.lg,
};