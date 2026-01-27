'use client';
import React, { useEffect, useState } from 'react';

// Define the structure of a changelog entry
interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

const WhatsNewPage: React.FC = () => {
  const [updates, setUpdates] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        // Fetch data from the local /public/updates.json file
        const response = await fetch('/updates.json');
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der lokalen Updates.json. Status: ${response.status}`);
        }
        const data = await response.json();
        setUpdates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>Was ist neu in OrdoServus?</h1>
      
      {loading && <p>Lade Neuigkeiten...</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      {!loading && !error && (
        <div style={styles.timeline}>
          {updates.map((entry) => (
            <article key={entry.version} style={styles.entry}>
              <header style={styles.entryHeader}>
                <span style={styles.date}>{entry.date}</span>
                <h2 style={styles.versionTitle}>v{entry.version}: {entry.title}</h2>
              </header>
              <ul style={styles.changeList}>
                {entry.changes.map((change, index) => (
                  <li key={index} style={styles.changeItem}>{change}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES (largely unchanged, using project conventions) ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '40px',
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#fff5f5',
    borderRadius: '8px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  entry: {
    borderLeft: '4px solid #007bff',
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '0 8px 8px 0',
  },
  entryHeader: {
    marginBottom: '12px',
  },
  date: {
    fontSize: '0.85rem',
    color: '#6c757d',
  },
  versionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#0056b3',
    marginTop: '4px',
  },
  changeList: {
    listStyle: 'disc',
    paddingLeft: '20px',
    margin: 0,
  },
  changeItem: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#495057',
    marginBottom: '8px',
  },
};

export default WhatsNewPage;
