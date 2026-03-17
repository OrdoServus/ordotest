'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, FileText, Calendar, Church } from 'lucide-react';

import ProfileMenu from './ProfileMenu'; // Import the new component

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = path === '/dashboard' ? pathname === path : pathname.startsWith(path);
    return isActive ? styles.navButtonActive : styles.navButton;
  };

  return (
    <nav style={styles.navContainer}>
      <div style={styles.leftContent}>
        <div style={styles.logo}>
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
            OrdoServus
          </Link>
        </div>
        <div style={styles.navButtons}>
          <Link href="/notizen" style={getLinkClass('/notizen')}>
            <FileText size={18} style={{ marginRight: '8px' }} />
            Notizen
          </Link>
          <Link href="/kalender" style={getLinkClass('/kalender')}>\n            <Calendar size={18} style={{ marginRight: '8px' }} />\n            Kalender\n          </Link>\n          <Link href="/gd" style={getLinkClass('/gd')}>\n            <Church size={18} style={{ marginRight: '8px' }} />\n            Gottesdienste\n          </Link>\n        </div>

      </div>
      <ProfileMenu /> 
    </nav>
  );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  navContainer: {
    width: '100%',
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #dee2e6',
    padding: '0 16px 0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logo: {
    fontWeight: '600',
    fontSize: '1.25rem',
    color: '#007bff',
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navButton: {
    padding: '8px 16px',
    border: '1px solid transparent',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#343a40',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    textDecoration: 'none',
  },
  navButtonActive: {
    padding: '8px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    color: '#007bff',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    textDecoration: 'none',
  },
};

export default Navbar;
