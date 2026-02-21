'use client';
import React from 'react';
import { ordoFileService } from './ordoFileSystem';
import VorlagenMenu from './VorlagenMenu';
import Editor from './Editor'; // Der neue Editor wird importiert

// Dokument interface
interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

// EditorProps interface
interface EditorProps {
  document: Dokument;
  onTitelChange: (wert: string) => void;
  onInhaltChange: (wert: string) => void;
}

export default function GottesdienstEditor({ document, onTitelChange, onInhaltChange }: EditorProps) {
    
  const handlePrint = () => {
    // TODO: Printing with Editor.js content needs a specific implementation
    // For now, we can try to print the raw HTML or a formatted version of it.
    window.print();
  };

  // RENDER GOTTESDIENST EDITOR (NEUER STIL mit Editor.js)
  return (
    <div style={styles.editorContainer} className="editor-container">
        {/* Die alte Toolbar wird entfernt, da Editor.js eine eigene UI mitbringt */}
      
      <div style={styles.headerBar}>
        <VorlagenMenu onVorlageWählen={onInhaltChange} />
        <button onClick={handlePrint} style={styles.actionButton}>🖨️ PDF</button>
        <button 
            onClick={() => ordoFileService.export(document)}
            title="Als .ordo Datei speichern"
            style={styles.actionButton}
        >
            💾 .ordo Export
        </button>
      </div>

      <div style={styles.scrollableArea} className="printable-area">
        <div style={styles.paperStyle}>
          <input 
            type="text" 
            value={document.titel}
            onChange={(e) => onTitelChange(e.target.value)}
            placeholder="Titel des Gottesdienstes..."
            style={styles.gottesdienstTitelInput}
          />
          {/* Hier wird der neue Editor eingesetzt */}
          <Editor
            value={document.inhalt} 
            onChange={onInhaltChange} 
          />
        </div>
      </div>
    </div>
  );
}

// STYLES
const styles: { [key: string]: React.CSSProperties } = {
  editorContainer: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#f1f3f4', 
    overflow: 'hidden' 
  },
  headerBar: {
    display: 'flex',
    padding: '8px 20px',
    background: '#f8f9fa',
    borderBottom: '1px solid #ddd',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  actionButton: {
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  scrollableArea: {
    overflowY: 'auto',
    flex: 1,
    padding: '20px 0',
  },
  paperStyle: {
    width: '100%',
    maxWidth: '850px',
    backgroundColor: 'white',
    padding: '40px 60px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    minHeight: '1000px',
    margin: '0 auto',
  },
  gottesdienstTitelInput: {
    width: '100%',
    fontSize: '2.5rem',
    border: 'none',
    outline: 'none',
    marginBottom: '30px',
    color: '#2c3e50',
    fontWeight: 'bold'
  },
};