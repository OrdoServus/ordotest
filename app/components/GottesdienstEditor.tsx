'use client';
import React, { useCallback } from 'react';
import { ordoFileService } from './ordoFileSystem';
import VorlagenMenu from './VorlagenMenu';
import Editor from './Editor';

interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

interface GottesdienstEditorProps {
  document: Dokument;
  onTitelChange: (wert: string) => void;
  onInhaltChange: (wert: string) => void;
  onSpeichern?: () => void;
}

export default function GottesdienstEditor({
  document,
  onTitelChange,
  onInhaltChange,
  onSpeichern,
}: GottesdienstEditorProps) {

  const handlePrint = useCallback(() => window.print(), []);

  const handleVorlageWählen = useCallback((htmlContent: string) => {
    // HTML direkt weitergeben – Editor.tsx konvertiert es intern
    onInhaltChange(htmlContent);
  }, [onInhaltChange]);

  return (
    <div style={styles.container} className="editor-container">

      {/* ── Toolbar ── */}
      <div style={styles.toolbar}>
        <VorlagenMenu onVorlageWählen={handleVorlageWählen} />

        <div style={styles.divider} />

        <button
          onClick={handlePrint}
          style={styles.toolBtn}
          title="Drucken / Als PDF speichern"
        >
          🖨️ PDF
        </button>

        <button
          onClick={() => ordoFileService.export(document)}
          style={styles.toolBtn}
          title="Als .ordo-Datei exportieren"
        >
          💾 Export
        </button>

        {onSpeichern && (
          <button
            onClick={onSpeichern}
            style={{ ...styles.toolBtn, ...styles.saveBtn }}
            title="Manuell speichern"
          >
            ✓ Speichern
          </button>
        )}

        {/* Autosave-Hinweis */}
        <span style={styles.autosaveHint}>
          ● Automatisch gespeichert
        </span>
      </div>

      {/* ── Papier ── */}
      <div style={styles.scrollArea} className="printable-area">
        <div style={styles.paper}>

          {/* Titel-Eingabe */}
          <input
            type="text"
            value={document.titel}
            onChange={(e) => onTitelChange(e.target.value)}
            placeholder="Titel des Gottesdienstes…"
            style={styles.titleInput}
          />

          <div style={styles.rule} />

          {/* Editor.js – documentId sorgt für sauberes Neu-Laden beim Wechsel */}
          <Editor
            value={document.inhalt}
            onChange={onInhaltChange}
            documentId={document.id}
          />
        </div>
      </div>

      {/* Druck-Stile */}
      <style>{printCSS}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f1f3f4',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #dde',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#dde',
    margin: '0 4px',
  },
  toolBtn: {
    padding: '6px 14px',
    cursor: 'pointer',
    backgroundColor: 'white',
    border: '1px solid #dde',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'Georgia, serif',
    color: '#2c3e50',
    transition: 'background 0.15s',
  },
  saveBtn: {
    backgroundColor: '#e8f7ee',
    borderColor: '#a8d8bc',
    color: '#1a7a41',
    fontWeight: 600,
  },
  autosaveHint: {
    marginLeft: 'auto',
    fontSize: '0.78rem',
    color: '#27ae60',
    opacity: 0.7,
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 0 80px',
    backgroundColor: '#f1f3f4',
  },
  paper: {
    width: '100%',
    maxWidth: '860px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '48px 64px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    minHeight: '1000px',
    borderRadius: '2px',
  },
  titleInput: {
    width: '100%',
    fontSize: '2.2rem',
    fontWeight: 700,
    fontFamily: 'Georgia, serif',
    color: '#2c3e50',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    letterSpacing: '-0.01em',
    marginBottom: '4px',
  },
  rule: {
    height: '2px',
    backgroundColor: '#eef0f3',
    marginBottom: '28px',
    borderRadius: '1px',
  },
};

const printCSS = `
  @media print {
    body * { visibility: hidden; }
    .printable-area, .printable-area * { visibility: visible; }
    .printable-area {
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      padding: 20mm 25mm;
    }
    .ce-toolbar { display: none !important; }
  }
`;