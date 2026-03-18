'use client';
import React, { useEffect, useState } from 'react';
import InfoLayout from '../InfoLayout';
import { colors, fontSizes, spacing, radius, sharedStyles } from '../theme';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export default function WhatsNewPage() {
  const [updates, setUpdates] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/ordoservus/ordoservus/releases');
        if (!response.ok) throw new Error(`Fehler beim Laden von GitHub. Status: ${response.status}`);
        const data = await response.json();
        const transformed: ChangelogEntry[] = data.map((release: any) => ({
          version: release.tag_name.replace('v', ''),
          date: new Date(release.published_at).toLocaleDateString('de-DE'),
          title: release.name || release.tag_name,
          changes: release.body ? release.body.split('\n').filter((l: string) => l.trim()) : [],
        }));
        setUpdates(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };
    fetchChangelog();
  }, []);

  return (
    <InfoLayout title="Was ist neu?" backHref="/info">
      <header style={sharedStyles.pageHeader}>
        <h1 style={sharedStyles.h1}>Was ist neu in OrdoServus?</h1>
      </header>

      {loading && <p style={{ textAlign: 'center', color: colors.textMuted }}>Lade Neuigkeiten...</p>}
      {error && <p style={sharedStyles.errorText}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {updates.map((entry) => (
            <article key={entry.version} style={timelineEntryStyle}>
              <header style={{ marginBottom: spacing.sm }}>
                <span style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>{entry.date}</span>
                <h2 style={{ fontSize: fontSizes.xl, fontWeight: '600', color: colors.primary, marginTop: '4px' }}>
                  v{entry.version}: {entry.title}
                </h2>
              </header>
              <ul style={sharedStyles.ul}>
                {entry.changes.map((change, i) => (
                  <li key={i} style={{ fontSize: fontSizes.base, lineHeight: '1.6', color: colors.text, marginBottom: '8px' }}>
                    {change}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </InfoLayout>
  );
}

const timelineEntryStyle: React.CSSProperties = {
  borderLeft: `4px solid ${colors.accent}`,
  padding: `15px ${spacing.md}`,
  backgroundColor: colors.bgPage,
  borderRadius: `0 ${radius.md} ${radius.md} 0`,
};