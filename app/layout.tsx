
import React from 'react';
import Navbar from './components/Navbar'; // Stellen Sie sicher, dass der Pfad korrekt ist

export const metadata = {
  title: 'OrdoServus',
  description: 'Gottesdienst- und Notizplaner',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" style={{ height: '100%' }}>
      <body style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
