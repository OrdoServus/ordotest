
import React from 'react';
import Navbar from './components/Navbar';
import { AuthProvider } from './AuthContext';

export const metadata = {
  title: 'OrdoServus',
  description: 'Gottesdienst- und Notizplaner',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" style={{ height: '100%' }}>
      <body style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <AuthProvider> {/* Umschließe die gesamte App mit dem AuthProvider */}
          <Navbar />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
