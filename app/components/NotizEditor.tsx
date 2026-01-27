'use client';
import React, { useRef } from 'react';

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
  titel: string;
  inhalt: string;
  onTitelChange: (wert: string) => void;
  onInhaltChange: (wert: string) => void;
  onSpeichern: () => void;
  document: Dokument;
}

export default function NotizEditor({ titel, inhalt, onTitelChange, onInhaltChange, onSpeichern, document: dok }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Hilfsfunktion für execCommand - nutzt das Browser-DOM-Objekt
  const exec = (cmd: string, val: string | undefined = undefined) => {
    window.document.execCommand(cmd, false, val);
    // Fokus zurück auf den Editor setzen
    editorRef.current?.focus();
  };

  // Handler für Textfarbe
  const handleTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec('foreColor', e.target.value);
  };

  // Handler für Hintergrundfarbe (Leuchtstift)
  const handleHighlight = () => {
    exec('backColor', 'yellow');
  };

  // Handler für Formatierung
  const handleFormat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    exec('formatBlock', e.target.value);
    e.target.value = 'p'; // Reset zur Standardauswahl
  };

  // Toolbar für den Notiz-Editor
  const toolbar = (
    <div style={styles.toolbarStyle}>
      {/* Rückgängig/Wiederholen */}
      <button 
        onClick={() => exec('undo')} 
        title="Rückgängig (Strg+Z)" 
        style={styles.buttonStyle}
      >
        ↩️
      </button>
      <button 
        onClick={() => exec('redo')} 
        title="Wiederholen (Strg+Y)" 
        style={styles.buttonStyle}
      >
        ↪️
      </button>
      
      <div style={styles.sep}></div>
      
      {/* Textformat */}
      <select 
        onChange={handleFormat} 
        style={styles.selectStyle}
        defaultValue="p"
      >
        <option value="p">Normaler Text</option>
        <option value="h1">Titel (groß)</option>
        <option value="h2">Zwischentitel</option>
        <option value="h3">Untertitel</option>
        <option value="blockquote">Zitat</option>
      </select>
      
      <div style={styles.sep}></div>
      
      {/* Textstile */}
      <button 
        onClick={() => exec('bold')} 
        title="Fett (Strg+B)" 
        style={styles.buttonStyle}
      >
        <b>B</b>
      </button>
      <button 
        onClick={() => exec('italic')} 
        title="Kursiv (Strg+I)" 
        style={styles.buttonStyle}
      >
        <i>I</i>
      </button>
      <button 
        onClick={() => exec('underline')} 
        title="Unterstrichen (Strg+U)" 
        style={styles.buttonStyle}
      >
        <u>U</u>
      </button>
      <button 
        onClick={() => exec('strikeThrough')} 
        title="Durchgestrichen" 
        style={styles.buttonStyle}
      >
        <s>S</s>
      </button>
      
      <div style={styles.sep}></div>
      
      {/* Farben */}
      <input 
        type="color" 
        title="Textfarbe ändern" 
        onChange={handleTextColor} 
        style={styles.colorStyle} 
        defaultValue="#000000"
      />
      <button 
        onClick={handleHighlight} 
        title="Textmarker (Gelb)" 
        style={styles.buttonStyle}
      >
        🖍️
      </button>
      
      <div style={styles.sep}></div>
      
      {/* Ausrichtung */}
      <button 
        onClick={() => exec('justifyLeft')} 
        title="Linksbündig" 
        style={styles.buttonStyle}
      >
        ≡
      </button>
      <button 
        onClick={() => exec('justifyCenter')} 
        title="Zentriert" 
        style={styles.buttonStyle}
      >
        ≣
      </button>
      <button 
        onClick={() => exec('justifyRight')} 
        title="Rechtsbündig" 
        style={styles.buttonStyle}
      >
        ≣
      </button>
      
      <div style={styles.sep}></div>
      
      {/* Listen */}
      <button 
        onClick={() => exec('insertUnorderedList')} 
        title="Aufzählung" 
        style={styles.buttonStyle}
      >
        • Liste
      </button>
      <button 
        onClick={() => exec('insertOrderedList')} 
        title="Nummerierte Liste" 
        style={styles.buttonStyle}
      >
        1. Liste
      </button>
      
      <div style={styles.sep}></div>
      
      {/* Einrückung */}
      <button 
        onClick={() => exec('indent')} 
        title="Einrücken" 
        style={styles.buttonStyle}
      >
        →
      </button>
      <button 
        onClick={() => exec('outdent')} 
        title="Ausrücken" 
        style={styles.buttonStyle}
      >
        ←
      </button>
      
      <div style={styles.sep}></div>
      
      {/* Weitere Funktionen */}
      <button 
        onClick={() => exec('removeFormat')} 
        title="Formatierung entfernen" 
        style={styles.buttonStyle}
      >
        🧹
      </button>
    </div>
  );

  // RENDER NOTIZBUCH EDITOR (ONE-NOTE-STIL)
  return (
    <div style={styles.editorContainer}>
      {toolbar}
      <div style={styles.notizEditorWrapper}>
        <input 
          type="text" 
          value={titel}
          onChange={(e) => onTitelChange(e.target.value)}
          onBlur={onSpeichern}
          placeholder="Seitentitel..."
          style={styles.notizTitelInput}
        />
        <div 
          ref={editorRef}
          contentEditable 
          spellCheck={true}
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

// STYLES
const styles: { [key: string]: React.CSSProperties } = {
  editorContainer: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#f1f3f4', 
    overflowY: 'auto',
    height: '100%',
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
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 10,
  },
  sep: { 
    width: '1px', 
    height: '20px', 
    background: '#ccc', 
    margin: '0 5px' 
  },
  buttonStyle: {
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    minWidth: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  selectStyle: {
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    height: '35px',
  },
  colorStyle: {
    width: '35px',
    height: '35px',
    padding: '2px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  notizEditorWrapper: {
    width: '100%',
    maxWidth: '960px',
    margin: '0 auto',
    padding: '30px 40px',
    flex: 1,
  },
  notizTitelInput: {
    width: '100%',
    fontSize: '2.2rem',
    border: 'none',
    outline: 'none',
    marginBottom: '20px',
    color: '#343a40',
    paddingBottom: '10px',
    borderBottom: '1px solid #e9ecef',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  notizEditorArea: {
    minHeight: 'calc(100vh - 250px)', 
    outline: 'none',
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }
};