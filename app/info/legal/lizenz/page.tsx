'use client';
import React from 'react';
import Link from 'next/link';

export default function LizenzPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div style={styles.page}>
        <nav style={styles.nav}>
            <Link href="/info" style={styles.backLink}>← Zurück zur Info-Seite</Link>
            <div style={{ fontWeight: 'bold' }}>Lizenz</div>
        </nav>
        <main style={styles.main}>
            <header style={styles.header}>
                <h1>MIT Lizenz</h1>
            </header>
            <section style={styles.content}>
                <p style={{ marginBottom: '20px' }}>
                    Copyright (c) {currentYear} OrdoServus Contributors
                </p>
                <p style={{ marginBottom: '20px' }}>
                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:
                </p>
                <p style={{ marginBottom: '20px' }}>
                    The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.
                </p>
                <p style={styles.disclaimer}>
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                    SOFTWARE.
                </p>
            </section>
        </main>
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
  disclaimer: {
    fontFamily: 'monospace',
    backgroundColor: '#eee',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  },
};