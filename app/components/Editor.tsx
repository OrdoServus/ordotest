'use client';
import React from 'react';
import { ordoFileService } from './ordoFileSystem';
import VorlagenMenu from './VorlagenMenu';

// Add the Dokument interface to match the one in page.tsx
interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

interface EditorProps {
  titel: string;
  inhalt: string;
  onTitelChange: (wert: string) => void;
  onInhaltChange: (wert: string) => void;
  onSpeichern: () => void;
  document: Dokument; // Use the Dokument interface here
}

export default function Editor({ titel, inhalt, onTitelChange, onInhaltChange, onSpeichern, document }: EditorProps) {
  const exec = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
  };
    
  const handlePrint = () => {
    window.print();
  };

  const toolbar = (
    <div style={styles.toolbarStyle}>
        <button onClick={() => exec('undo')} title="Rückgängig" style={styles.buttonStyle}>↩️</button>
        <button onClick={() => exec('redo')} title="Wiederholen" style={styles.buttonStyle}>↪️</button>
        <div style={styles.sep}></div>
        <select onChange={(e) => exec('formatBlock', e.target.value)} style={styles.selectStyle}>
          <option value="p">Normaler Text</option>
          <option value="h1">Titel (groß)</option>
          <option value="h2">Zwischentitel</option>
          <option value="blockquote">Zitat</option>
        </select>
        <div style={styles.sep}></div>
        <button onClick={() => exec('bold')} style={styles.buttonStyle}><b>B</b></button>
        <button onClick={() => exec('italic')} style={styles.buttonStyle}><i>I</i></button>
        <button onClick={() => exec('underline')} style={styles.buttonStyle}><u>U</u></button>
        <input type="color" title="Textfarbe" onChange={(e) => exec('foreColor', e.target.value)} style={styles.colorStyle} />
        <button onClick={() => exec('backColor', 'yellow')} title="Leuchtstift" style={styles.buttonStyle}>🖍️</button>
        <div style={styles.sep}></div>
        <button onClick={() => exec('justifyLeft')} style={styles.buttonStyle}>≡</button>
        <button onClick={() => exec('justifyCenter')} style={styles.buttonStyle}>≣</button>
        <button onClick={() => exec('insertUnorderedList')} style={styles.buttonStyle}>• Liste</button>
        {document.typ === 'gottesdienst' && (
          <>
            <div style={styles.sep}></div>
            <VorlagenMenu onVorlageWählen={onInhaltChange} />
          </>
        )}
        <div style={styles.sep}></div>
        <button onClick={handlePrint} style={{ ...styles.buttonStyle, backgroundColor: '#2c3e50', color: 'white' }}>🖨️ PDF</button>
        <button 
          onClick={() => ordoFileService.export(inhalt)}
          title="Als .ordo Datei speichern"
          style={styles.buttonStyle}
        >
          💾 .ordo Export
        </button>
      </div>
  );

  // --- RENDER NOTIZBUCH EDITOR (ONE-NOTE-STIL) ---
  if (document.typ === 'notiz') {
      return (
        <div style={styles.editorContainer}>
            {toolbar}
            <div style={styles.notizEditorWrapper}>
                <input 
                    type="text" 
                    value={titel}
                    onChange={(e) => onTitelChange(e.target.value)}
                    placeholder="Seitentitel..."
                    style={styles.notizTitelInput}
                />
                <div 
                    contentEditable 
                    spellCheck="true"
                    suppressContentEditableWarning
                    onInput={(e) => onInhaltChange(e.currentTarget.innerHTML)}
                    onBlur={onSpeichern}
                    dangerouslySetInnerHTML={{ __html: inhalt }}
                    style={styles.notizEditorArea}
                />
            </div>
        </div>
      );
  }

  // --- RENDER GOTTESDIENST EDITOR (CLASSIC-STIL) ---
  return (
    <div style={styles.editorContainer} className="editor-container">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .editor-container, .sidebar, header, nav { display: none !important; }
        }
      `}</style>
      
      {toolbar}

      <div style={{ padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }} className="printable-area">
        <div style={styles.paperStyle}>
          <input 
            type="text" 
            value={titel}
            onChange={(e) => onTitelChange(e.target.value)}
            placeholder="Titel des Gottesdienstes..."
            style={styles.gottesdienstTitelInput}
          />
          <div 
            contentEditable 
            spellCheck="true"
            suppressContentEditableWarning
            onInput={(e) => onInhaltChange(e.currentTarget.innerHTML)}
            onBlur={onSpeichern}
            dangerouslySetInnerHTML={{ __html: inhalt }}
            style={styles.gottesdienstEditorArea}
          />
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  // --- Gemeinsame Stile ---
  editorContainer: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#f1f3f4', 
    overflowY: 'auto' 
  },
  toolbarStyle: { 
    display: 'flex', 
    gap: '5px', 
    padding: '8px 20px', 
    background: '#f8f9fa', 
    borderBottom: '1px solid #ddd', 
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: 0,
  },
  sep: { width: '1px', height: '20px', background: '#ccc', margin: '0 5px' },
  buttonStyle: {
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    minWidth: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectStyle: {
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  colorStyle: {
    width: '30px',
    height: '30px',
    padding: '0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer'
  },

  // --- Gottesdienst-Editor Stile ---
  paperStyle: {
    width: '100%',
    maxWidth: '850px',
    backgroundColor: 'white',
    padding: '60px 80px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    minHeight: '1100px',
    margin: '20px 0',
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
  gottesdienstEditorArea: {
    minHeight: '800px',
    outline: 'none',
    fontSize: '1.2rem',
    lineHeight: '1.7',
    color: '#333',
    textAlign: 'left'
  },

  // --- Notiz-Editor Stile (OneNote-Look) ---
  notizEditorWrapper: {
      width: '100%',
      maxWidth: '960px',
      margin: '0 auto',
      padding: '30px 40px',
  },
  notizTitelInput: {
      width: '100%',
      fontSize: '2.2rem',
      border: 'none',
      outline: 'none',
      marginBottom: '20px',
      color: '#343a40',
      paddingBottom: '10px',
      borderBottom: '1px solid #e9ecef'
  },
  notizEditorArea: {
      minHeight: 'calc(100vh - 200px)', 
      outline: 'none',
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#333',
  }
};
