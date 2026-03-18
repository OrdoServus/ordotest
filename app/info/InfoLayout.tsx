'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import Footer from './Footer';

interface InfoLayoutProps {
  children: ReactNode;
  title: string;
  backHref?: string;
  showNav?: boolean;
}

export default function InfoLayout({
  children,
  title,
  backHref = '/info',
  showNav = true
}: InfoLayoutProps) {
  return (
    <div style={styles.page}>
      {showNav && (
        <nav style={styles.nav}>
          <Link href={backHref} style={styles.backLink}>← Zurück</Link>
          <div style={styles.navTitle}>{title}</div>
        </nav>
      )}
      <main style={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9f9fb',
    color: '#333',
    lineHeight: '1.6',
    minHeight: '100vh'
  },
  nav: {
    padding: '20px 20px 0',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  backLink: {
    textDecoration: 'none',
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: '1rem'
  },
  navTitle: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#2c3e50',
    marginLeft: 'auto'
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px'
  }
};

