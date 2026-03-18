'use client';
import React from 'react';
import Link from 'next/link';
import Footer from './Footer';
import { colors, fonts, fontSizes, spacing, radius, shadows, sharedStyles } from './theme';

export default function InfoPage() {
  return (
    <div style={{ fontFamily: fonts.base, color: colors.text, lineHeight: '1.6' }}>

      {/* Navigation */}
      <nav style={sharedStyles.navFull}>
        <Link href="/" style={{ textDecoration: 'none', color: colors.primary }}>
          <div style={{ fontWeight: 'bold', fontSize: fontSizes.xl }}>OrdoServus</div>
        </Link>
      </nav>

      {/* Hero */}
      <header style={heroStyle}>
        <h1 style={{ fontSize: fontSizes.hero, marginBottom: spacing.md }}>
          Dein digitaler Dienst am Altar & Schreibtisch
        </h1>
        <p style={{ fontSize: fontSizes.lg, maxWidth: '800px', margin: `0 auto ${spacing.lg}` }}>
          OrdoServus unterstützt dich als Pfarrer, Diakon oder liturgischen Dienst bei der Vorbereitung
          deiner liturgischen Aufgaben und der Organisation deiner pastoralen Gedanken.
        </p>
        <Link href="/login">
          <button style={sharedStyles.buttonCta}>Jetzt starten</button>
        </Link>
      </header>

      {/* Navigation Cards */}
      <section style={cardsSectionStyle}>
        <Link href="/info/downloads" style={cardLinkStyle}>
          <div style={cardStyle}><h3>Downloads</h3><p>Apps für all deine Geräte.</p></div>
        </Link>
        <a href="https://github.com/ordoservus/ordoservus/wiki" target="_blank" rel="noopener noreferrer" style={cardLinkStyle}>
          <div style={cardStyle}><h3>Hilfe</h3><p>Anleitungen und FAQs.</p></div>
        </a>
        <Link href="/info/kontakt" style={cardLinkStyle}>
          <div style={cardStyle}><h3>Kontakt</h3><p>Schreib uns.</p></div>
        </Link>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: spacing.xxl + ' ' + spacing.md, backgroundColor: colors.bgCard }}>
        <h2 style={{ textAlign: 'center', fontSize: fontSizes.xxl, marginBottom: spacing.xl }}>
          Entwickelt für deine Seelsorge
        </h2>
        <div style={featureGrid}>
          {[
            { icon: '👩‍👧‍👦', title: 'für Pfarrer, Diakon oder liturgischen Dienst', text: 'Die Anwendung ist für dich als Pfarrer, Diakon oder liturgischen Dienst entwickelt und angepasst.' },
            { icon: '⛪', title: 'Liturgische Vorlagen', text: 'Strukturierte Abläufe für Messen, Andachten und Taufen. Kein "leeres Blatt" mehr bei deiner Vorbereitung.' },
            { icon: '📓', title: 'Flexibles Notizbuch', text: 'Einfache Organisation wie in OneNote. Perfekt für deine Katechese, Predigtideen und Gremienarbeit.' },
            { icon: '📆', title: 'Kalender', text: 'Plane deine Andachte und verliere den Überblick nicht.' },
          ].map(f => (
            <div key={f.title} style={featureCard}>
              <h3>{f.icon} {f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section id="ueber" style={{ padding: `${spacing.xxl} ${spacing.md}`, backgroundColor: colors.bgMuted }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: fontSizes.xxl, marginBottom: spacing.sm }}>Die Vision</h2>
          <p>
            OrdoServus entstand aus unserer Idee, moderne Webtechnologie mit den Anforderungen deines kirchlichen Alltags zu verbinden.
            Es ist ein Open-Source-Projekt, das einfach, schnell und unabhängig funktionieren soll. Wir glauben daran, dass
            Technologie deine Seelsorge unterstützen kann, ohne Kompromisse bei Datenschutz und Benutzerfreundlichkeit einzugehen.
            Dieses Produkt haben wir für dich entwickelt, damit du deinen Dienst am Altar und im pastoralen Alltag bestmöglich
            gestalten kannst.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const heroStyle: React.CSSProperties = {
  padding: `${spacing.xxl} ${spacing.md}`,
  textAlign: 'center',
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accentBlue} 100%)`,
  color: colors.white,
};

const cardsSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: spacing.md,
  padding: `${spacing.xl} ${spacing.md}`,
  backgroundColor: colors.bgMuted,
};

const cardLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  flex: '1 1 250px',
  maxWidth: '300px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgCard,
  padding: '25px',
  borderRadius: radius.lg,
  textAlign: 'center',
  boxShadow: shadows.card,
  transition: 'transform 0.2s',
};

const featureGrid: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.lg,
  maxWidth: '900px',
  margin: '0 auto',
};

const featureCard: React.CSSProperties = {
  padding: spacing.lg,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.lg,
  textAlign: 'center',
};