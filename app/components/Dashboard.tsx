'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import UpcomingAppointments from './UpcomingAppointments'; // Import der neuen Komponente

// TypeScript-Interfaces für Typensicherheit
interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

interface DashboardProps {
  dokumente: Dokument[];
  onNeuGottesdienst: () => void;
  onNeuNotiz: () => void;
}

export default function Dashboard({ dokumente, onNeuGottesdienst, onNeuNotiz }: DashboardProps) {
  const { userProfile } = useAuth();
  const router = useRouter();

  const liturgienCount = dokumente.filter((d) => d.typ === 'gottesdienst').length;
  const notizenCount = dokumente.filter((d) => d.typ === 'notiz').length;

  return (
    <div style={containerStyle}>
        <header style={headerStyle}>
            <div>
            <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>
                {userProfile?.firstName ? `Willkommen, ${userProfile.firstName}` : 'Willkommen bei OrdoServus'}
            </h1>
            <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>Was möchten Sie heute tun?</p>
            </div>
        </header>

        <div style={bannerStyle}>
            Information: Diese Anwendung ist in der ALPHA-Phase! <a href="/info" style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'none' }}>Mehr erfahren</a>
        </div>

        {/* HIER WIRD DIE NEUE KOMPONENTE EINGEFÜGT */}
        <div style={{width: '100%', maxWidth: '1000px', padding: '0 20px', marginBottom: '30px'}}>
            <UpcomingAppointments />
        </div>

        <div style={gridStyle}>
            <div onClick={onNeuGottesdienst} style={{...cardStyle, borderTop: '8px solid #2c3e50'}}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⛪</div>
            <h2 style={{ color: '#2c3e50' }}>Gottesdienst-Planer</h2>
            <p style={pStyle}>Erstellen Sie Abläufe, Predigten und liturgische Texte mit Vorlagen.</p>
            <span style={badgeStyle}>{liturgienCount} Entwürfe</span>
            <button onClick={(e) => { e.stopPropagation(); onNeuGottesdienst(); }} style={btnStyle('#2c3e50')}>
                + Neu erstellen
            </button>
            </div>

            <div onClick={onNeuNotiz} style={{...cardStyle, borderTop: '8px solid #80397B'}}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📓</div>
            <h2 style={{ color: '#80397B' }}>Digitales Notizbuch</h2>
            <p style={pStyle}>Organisieren Sie Gedanken, Katechese und Verwaltungsnotizen im OneNote-Stil.</p>
            <span style={badgeStyle}>{notizenCount} Seiten</span>
            <button onClick={(e) => { e.stopPropagation(); onNeuNotiz(); }} style={btnStyle('#80397B')}>
                + Neue Notiz
            </button>
            </div>
        </div>

        <footer style={footerStyle}>
            <p>© {new Date().getFullYear()} OrdoServus – Open Source Projekt</p>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/info/legal/impressum" style={footerLinkStyle}>Impressum</Link>
            <Link href="/info/legal/datenschutz" style={footerLinkStyle}>Datenschutz</Link>
            <Link href="/info/legal/lizenz" style={footerLinkStyle}>Lizenz</Link>
            <a href="https://github.com/ordoservus/ordoservus" target="_blank" rel="noopener noreferrer" style={footerLinkStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            </a>
            </div>
        </footer>
    </div>
  );
}

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  flex: 1, backgroundColor: '#f9f9fb',
  display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const headerStyle: React.CSSProperties = { textAlign: 'center', padding: '60px 20px 50px 20px', width: '100%' };

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '30px', width: '100%', maxWidth: '1000px',
  marginBottom: '50px', padding: '0 20px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '40px', borderRadius: '15px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)', cursor: 'pointer',
  transition: 'transform 0.2s, boxShadow 0.2s', textAlign: 'center' as 'center',
  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
};

const pStyle = { color: '#666', lineHeight: '1.5', marginBottom: '20px' };

const badgeStyle = { 
  display: 'inline-block', padding: '5px 15px', backgroundColor: '#f0f2f5', 
  borderRadius: '20px', fontSize: '0.85rem', color: '#555', marginBottom: '20px' 
};

const btnStyle = (color: string) => ({
  backgroundColor: color, color: 'white', border: 'none', 
  padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as 'bold'
});

const footerStyle: React.CSSProperties = {
  padding: '40px 20px', 
  textAlign: 'center', 
  backgroundColor: '#2c3e50', 
  color: 'white',
  width: '100%'
};

const footerLinkStyle: React.CSSProperties = {
    color: '#aaa', margin: '5px 10px', textDecoration: 'none'
};

const bannerStyle: React.CSSProperties = {
  backgroundColor: '#e8f4fd',
  border: '1px solid #b3d9ff',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '30px',
  textAlign: 'center',
  color: '#2c3e50',
  fontSize: '1rem',
  width: 'calc(100% - 40px)',
  maxWidth: '1000px'
};