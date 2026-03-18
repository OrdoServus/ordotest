'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import Footer from './Footer';
import { sharedStyles } from './theme';

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
  showNav = true,
}: InfoLayoutProps) {
  return (
    <div style={sharedStyles.page}>
      {showNav && (
        <nav style={sharedStyles.nav}>
          <Link href={backHref} style={sharedStyles.backLink}>← Zurück</Link>
          <div style={sharedStyles.navTitle}>{title}</div>
        </nav>
      )}
      <main style={sharedStyles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
}