'use client';
import React from 'react';
import Link from 'next/link';
import InfoLayout from '../InfoLayout';
import { colors, fontSizes, spacing, radius, sharedStyles } from '../theme';

interface DownloadOptionProps {
  title: string;
  comingSoon?: boolean;
}

const DownloadOption = ({ title, comingSoon = false }: DownloadOptionProps) => (
  <div style={downloadOptionStyle}>
    <h3 style={{ margin: 0, fontSize: fontSizes.md }}>{title}</h3>
    {comingSoon && <span style={disabledBadgeStyle}>Bald verfügbar</span>}
  </div>
);

export default function DownloadsPage() {
  return (
    <InfoLayout title="OrdoServus Downloads">
      <header style={sharedStyles.pageHeader}>
        <h1 style={sharedStyles.h1}>Lade OrdoServus herunter</h1>
        <p style={sharedStyles.subtitle}>
          Greife auf OrdoServus über unsere Web-App zu. Apps für Desktop und Mobilgeräte sind in Vorbereitung.
        </p>
      </header>

      {/* Web App */}
      <div style={webAppCardStyle}>
        <h2>Web-App</h2>
        <p>Nutze die volle Funktionalität von OrdoServus direkt im Browser. Keine Installation notwendig.</p>
        <Link href="/" style={sharedStyles.buttonPrimary}>
          Web-App starten
        </Link>
      </div>

      {/* Desktop & Mobile */}
      <div style={appsContainerStyle}>
        <div style={categoryStyle}>
          <h2 style={categoryTitleStyle}>Desktop</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <DownloadOption title="Windows" comingSoon />
            <DownloadOption title="macOS" comingSoon />
            <DownloadOption title="Linux" comingSoon />
          </div>
        </div>

        <div style={categoryStyle}>
          <h2 style={categoryTitleStyle}>Mobil</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <DownloadOption title="iOS" comingSoon />
            <DownloadOption title="Android" comingSoon />
          </div>
        </div>
      </div>
    </InfoLayout>
  );
}

const webAppCardStyle: React.CSSProperties = {
  ...sharedStyles.contentCard,
  textAlign: 'center',
  marginBottom: spacing.xl,
};

const appsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: spacing.lg,
};

const categoryStyle: React.CSSProperties = {
  flex: '1 1 300px',
  minWidth: '280px',
};

const categoryTitleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: spacing.md,
  fontSize: fontSizes.xl,
  color: colors.primary,
};

const downloadOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: colors.bgPage,
  padding: `15px ${spacing.md}`,
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
};

const disabledBadgeStyle: React.CSSProperties = {
  padding: '8px 15px',
  backgroundColor: '#ecf0f1',
  color: '#bdc3c7',
  borderRadius: radius.sm,
  fontWeight: 'bold',
  fontSize: fontSizes.sm,
};