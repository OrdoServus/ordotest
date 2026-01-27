'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';

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
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');

  // Setze den Inhalt nur beim initialen Laden oder wenn das Dokument gewechselt wird
  useEffect(() => {
    if (editorRef.current && (isInitialMount.current || editorRef.current.innerHTML !== inhalt)) {
      // Nur setzen wenn der Inhalt wirklich unterschiedlich ist
      if (editorRef.current.innerHTML !== inhalt) {
        editorRef.current.innerHTML = inhalt;
      }
      isInitialMount.current = false;
    }
  }, [dok.id]); // Nur bei Dokument-Wechsel neu setzen

  // Auto-Save mit Debounce (2 Sekunden nach letzter Änderung)
  const triggerAutoSave = () => {
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      onSpeichern();
      setSaveStatus('saved');
      
      // Nach 2 Sekunden wieder auf 'idle' setzen
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 2000); // Speichert 2 Sekunden nach der letzten Änderung
  };

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Hilfsfunktion für execCommand
  const exec = (cmd: string, val: string | undefined = undefined) => {
    window.document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  // Handler für Titel-Änderungen
  const handleTitelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTitelChange(e.target.value);
    triggerAutoSave();
  };

  // Handler für Inhalt-Änderungen
  const handleInhaltChange = (e: React.FormEvent<HTMLDivElement>) => {
    onInhaltChange(e.currentTarget.innerHTML);
    triggerAutoSave();
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
    e.target.value = 'p';
  };

  // Render Save-Status
  const renderSaveStatus = () => {
    if (saveStatus === 'saving') {
      return (
        <div style={styles.saveStatus}>
          <Save size={14} className="spin" />
          <span>Speichert...</span>
        </div>
      );
    }
    if (saveStatus === 'saved') {
      return (
        <div style={styles.saveStatusSaved}>
          <Check size={14} />
          <span>Gespeichert</span>
        </div>
      );
    }
    return null;
  };

  // Toolbar
  const toolbar = (
    <div style={styles.toolbarStyle}>
      <div style={styles.toolbarLeft}>
        {/* Rückgängig/Wiederholen */}
        <div style={styles.buttonGroup}>
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
        </div>
        
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
        <div style={styles.buttonGroup}>
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
        </div>
        
        <div style={styles.sep}></div>
        
        {/* Farben */}
        <div style={styles.buttonGroup}>
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
        </div>
        
        <div style={styles.sep}></div>
        
        {/* Ausrichtung */}
        <div style={styles.buttonGroup}>
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
            ≡
          </button>
        </div>
        
        <div style={styles.sep}></div>
        
        {/* Listen */}
        <div style={styles.buttonGroup}>
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
        </div>
        
        <div style={styles.sep}></div>
        
        {/* Einrückung */}
        <div style={styles.buttonGroup}>
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
        </div>
        
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

      {/* Save-Status rechts */}
      <div style={styles.toolbarRight}>
        {renderSaveStatus()}
      </div>
    </div>
  );

  // RENDER
  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
      
      <div style={styles.editorContainer}>
        {toolbar}
        <div style={styles.notizEditorWrapper}>
          <input 
            type="text" 
            value={titel}
            onChange={handleTitelChange}
            placeholder="Seitentitel..."
            style={styles.notizTitelInput}
          />
          <div 
            ref={editorRef}
            contentEditable 
            spellCheck={true}
            suppressContentEditableWarning
            onInput={handleInhaltChange}
            style={styles.notizEditorArea}
          />
        </div>
      </div>
    </>
  );
}

// STYLES
const styles: { [key: string]: React.CSSProperties } = {
  editorContainer: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#fafbfc', 
    overflowY: 'auto',
    height: '100%',
  },
  toolbarStyle: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px', 
    padding: '10px 24px', 
    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)', 
    borderBottom: '1px solid #e1e4e8', 
    flexWrap: 'wrap',
    flexShrink: 0,
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: '2px',
    backgroundColor: '#f6f8fa',
    borderRadius: '6px',
    padding: '2px',
    border: '1px solid #e1e4e8',
  },
  sep: { 
    width: '1px', 
    height: '24px', 
    background: '#e1e4e8', 
    margin: '0 4px',
  },
  buttonStyle: {
    padding: '6px 12px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    minWidth: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    color: '#24292f',
    fontWeight: '500',
  },
  selectStyle: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e1e4e8',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    height: '36px',
    color: '#24292f',
    fontWeight: '500',
  },
  colorStyle: {
    width: '36px',
    height: '36px',
    padding: '3px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  saveStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  saveStatusSaved: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#d4edda',
    color: '#155724',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  notizEditorWrapper: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '48px 60px',
    flex: 1,
    backgroundColor: 'white',
    minHeight: 'calc(100vh - 120px)',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
  },
  notizTitelInput: {
    width: '100%',
    fontSize: '2.5rem',
    border: 'none',
    outline: 'none',
    marginBottom: '32px',
    color: '#1a1a1a',
    paddingBottom: '16px',
    borderBottom: '2px solid #e1e4e8',
    fontWeight: '700',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    letterSpacing: '-0.02em',
  },
  notizEditorArea: {
    minHeight: 'calc(100vh - 300px)', 
    outline: 'none',
    fontSize: '1.125rem',
    lineHeight: '1.75',
    color: '#24292f',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }
};