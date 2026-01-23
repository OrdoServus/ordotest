import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrdoServus",
  description: "strukturierte Gottesdienst-Planung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>OrdoServus</div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <a href="/info" style={{ cursor: 'pointer', fontSize: '1.2rem', textDecoration: 'none' }}>⚙️</a> {/* Setting Icon */}
            <a href="/info/help" style={{ cursor: 'pointer', fontSize: '1.2rem', textDecoration: 'none' }}>ℹ</a> {/* Hilfe Icon */}
          </div>
        </header>
        <div style={{ paddingTop: '50px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
