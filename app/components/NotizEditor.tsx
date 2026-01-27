'use client';
import React from 'react';

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

export default function NotizEditor({ titel, inhalt, onTitelChange, onInhaltChange, onSpeichern, document }: EditorProps) {
  const exec = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
  };

  // Toolbar for the Notiz editor
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

// STYLES
const styles: { [key: string]: React.CSSProperties } = {
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