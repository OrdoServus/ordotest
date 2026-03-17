'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import UpcomingAppointments from './UpcomingAppointments';

interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'notiz';
  isFavorit: boolean;
  datum: any;
}

interface DashboardProps {
  dokumente: Dokument[];
  onNeuNotiz: () => void;
}

export default function Dashboard({ dokumente, onNeuNotiz }: DashboardProps) {
  const { userProfile } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <header style={s.header}>
        <h1 style={s.h1}>
          {userProfile?.firstName ? `${greeting()}, ${userProfile.firstName}` : 'Willkommen bei OrdoServus'}
        </h1>
        <p style={s.subtitle}>Was willst du heute tun?</p>
      </header>

      {/* Alpha Banner */}
      <div style={s.banner}>
        ℹ️ Diese Anwendung befindet sich in der <strong>Alpha-Phase</strong>.{' '}
        <Link href="/info" style={s.bannerLink}>Mehr erfahren</Link>
      </div>

      {/* Upcoming Appointments */}
      <div style={s.upcomingWrapper}>
        <UpcomingAppointments />
      </div>

      {/* Action Cards */}
      <div style={s.grid}>
        {/* Notizbuch Card */}
        <div
          style={{ ...s.card, borderTop: '6px solid #80397B' }}
          onClick={onNeuNotiz}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onNeuNotiz()}
        >
          <div style={s.cardIcon}>📓</div>
          <h2 style={{ ...s.cardTitle, color: '#80397B' }}>Digitales Notizbuch</h2>
          <p style={s.cardText}>Gedanken, Katechese und Verwaltungsnotizen – alles an einem Ort.</p>
          <button
            style={s.btn('#80397B')}
            onClick={e => { e.stopPropagation(); onNeuNotiz(); }}
          >
            + Neue Notiz
          </button>
        </div>

        {/* Kalender Card */}
        <div
          style={{ ...s.card, borderTop: '6px solid #27ae60', cursor: 'default' }}
        >
          <div style={s.cardIcon}>📅</div>
          <h2 style={{ ...s.cardTitle, color: '#27ae60' }}>Kalender</h2>
          <p style={s.cardText}>Pfarr- und Privatkalender, Terminverwaltung und Erinnerungen.</p>
          <span style={s.badge}>Kalender verwalten</span>
          <Link href="/kalender" style={{ textDecoration: 'none' }}>
            <button style={s.btn('#27ae60')}>
              Zum Kalender
            </button>
          </Link>
        </div>

        {/* Gottesdienste Card */}
        <div
          style={{ ...s.card, borderTop: '6px solid #3498db', cursor: 'default' }}
        >
          <div style={s.cardIcon}>⛪</div>
          <h2 style={{ ...s.cardTitle, color: '#3498db' }}>Gottesdienste</h2>
          <p style={s.cardText}>Gottesdienstplaner mit Liturgiebausteinen und Exportfunktionen.</p>
          <span style={s.badge}>Bausteine &amp; Export</span>
          <Link href="/gd" style={{ textDecoration: 'none' }}>
            <button style={s.btn('#3498db')}>
              Gottesdienste planen
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <p>© {new Date().getFullYear()} OrdoServus – Open Source Projekt</p>
        <div style={s.footerLinks}>
          <Link href="/info/legal/impressum"  style={s.footerLink}>Impressum</Link>
          <Link href="/info/legal/datenschutz" style={s.footerLink}>Datenschutz</Link>
          <a
            href="https://github.com/flohulo/ordoservus"
            target="_blank"
            rel="noopener noreferrer"
            style={s.footerLink}
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338 .726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: { [key: string]: any} = {
  container:      { flex: 1, backgroundColor: '#f9f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header:         { textAlign: 'center', padding: '50px 20px 30px' },
  h1:             { fontSize: '2.2rem', color: '#2c3e50', margin: '0 0 8px' },
  subtitle:       { color: '#7f8c8d', fontSize: '1.1rem', margin: 0 },
  banner:         { backgroundColor: '#e8f4fd', border: '1px solid #b3d9ff', borderRadius: '8px', padding: '12px 20px', marginBottom: '24px', textAlign: 'center', color: '#2c3e50', fontSize: '0.95rem', width: '100%', maxWidth: '1000px', boxSizing: 'border-box' },
  bannerLink:     { color: '#007bff', textDecoration: 'none' },
  upcomingWrapper:{ width: '100%', maxWidth: '1000px', padding: '0 20px', marginBottom: '28px', boxSizing: 'border-box' },
  grid:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', width: '100%', maxWidth: '1000px', marginBottom: '50px', padding: '0 20px', boxSizing: 'border-box' },
  card:           { backgroundColor: 'white', padding: '36px 32px', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  cardIcon:       { fontSize: '2.8rem' },
  cardTitle:      { margin: 0, fontSize: '1.3rem', fontWeight: 700 },
  cardText:       { color: '#666', lineHeight: 1.5, margin: 0, fontSize: '0.95rem' },
  badge:          { display: 'inline-block', padding: '4px 14px', backgroundColor: '#f0f2f5', borderRadius: '20px', fontSize: '0.82rem', color: '#555' },
  btn:            (color: string): React.CSSProperties => ({ backgroundColor: color, color: 'white', border: 'none', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', width: '100%' }),
  footer:         { padding: '36px 20px', textAlign: 'center', backgroundColor: '#2c3e50', color: 'white', width: '100%', boxSizing: 'border-box' },
  footerLinks:    { marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '4px' },
  footerLink:     { color: '#aaa', margin: '4px 10px', textDecoration: 'none' },
};
