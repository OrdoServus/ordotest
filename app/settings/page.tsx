'use client';
import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Einstellungen</h1>
      <p style={styles.subtitle}>Verwalten Sie hier Ihre Anwendungs-Einstellungen.</p>

      <div style={styles.settingsSection}>
        <h2 style={styles.sectionTitle}>Allgemein</h2>
        <div style={styles.settingItem}>
          <label style={styles.settingLabel}>Sprache</label>
          <p style={styles.settingValue}>Deutsch</p>
        </div>
        <div style={styles.settingItem}>
          <label style={styles.settingLabel}>Zeitzone</label>
          <p style={styles.settingValue}>(GMT+2) Mitteleuropäische Sommerzeit</p>
        </div>
      </div>

      <div style={styles.settingsSection}>
        <h2 style={styles.sectionTitle}>Benachrichtigungen</h2>
        <div style={styles.settingItem}>
          <label style={styles.settingLabel}>E-Mail-Benachrichtigungen</label>
          <p style={styles.settingValue}>Aktiviert</p>
        </div>
      </div>

       <div style={styles.settingsSection}>
        <h2 style={styles.sectionTitle}>Darstellung</h2>
         <div style={styles.settingItem}>
          <label style={styles.settingLabel}>Theme</label>
          <p style={styles.settingValue}>Standard</p>
        </div>
      </div>

    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '40px',
  },
  settingsSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#007bff',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  settingItem: {
    marginBottom: '15px',
  },
  settingLabel: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '5px',
  },
  settingValue: {
    fontSize: '1rem',
    color: '#333',
    margin: 0,
  },
};

export default SettingsPage;
