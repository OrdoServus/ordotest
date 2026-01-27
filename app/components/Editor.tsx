'use client';
import React from 'react';
import { ordoFileService } from './ordoFileSystem';
import VorlagenMenu from './VorlagenMenu';

interface EditorProps {
  titel: string;
  inhalt: string;
  onTitelChange: (wert: string) => void;
  onInhaltChange: (wert: string) => void;
  onSpeichern: () => void;
  document: any;
}

export default function Editor({ titel, inhalt, onTitelChange, onInhaltChange, onSpeichern, document }: EditorProps) {
  const exec = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
  };
    
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f1f3f4' }} className="editor-container">
      
      {/* --- PRINT STYLES --- */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .editor-container, .sidebar, header {
            display: none !important;
          }
        }
      `}</style>
      
      {/* --- TOOLBAR --- */}
      <div style={toolbarStyle}>
        {/* Historie */}
        <button onClick={() => exec('undo')} title="Rückgängig" style={buttonStyle}>↩️</button>
        <button onClick={() => exec('redo')} title="Wiederholen" style={buttonStyle}>↪️</button>
        
        <div style={sep}></div>

        {/* Text-Format (Titel, Zwischentitel) */}
        <select onChange={(e) => exec('formatBlock', e.target.value)} style={selectStyle}>
          <option value="p">Normaler Text</option>
          <option value="h1">Titel (groß)</option>
          <option value="h2">Zwischentitel</option>
          <option value="blockquote">Zitat</option>
        </select>

        <div style={sep}></div>

        {/* Schrift-Styles */}
        <button onClick={() => exec('bold')} style={buttonStyle}><b>B</b></button>
        <button onClick={() => exec('italic')} style={buttonStyle}><i>I</i></button>
        <button onClick={() => exec('underline')} style={buttonStyle}><u>U</u></button>
        
        {/* Farben */}
        <input type="color" title="Textfarbe" onChange={(e) => exec('foreColor', e.target.value)} style={colorStyle} />
        <button onClick={() => exec('backColor', 'yellow')} title="Leuchtstift" style={buttonStyle}>🖍️</button>

        <div style={sep}></div>

        {/* Ausrichtung */}
        <button onClick={() => exec('justifyLeft')} style={buttonStyle}>≡</button>
        <button onClick={() => exec('justifyCenter')} style={buttonStyle}>≣</button>
        
        {/* Listen */}
        <button onClick={() => exec('insertUnorderedList')} style={buttonStyle}>• Liste</button>

        {document.typ === 'gottesdienst' && (
          <>
            <div style={sep}></div>
            <VorlagenMenu onVorlageWählen={onInhaltChange} />
          </>
        )}

        <div style={sep}></div>

        {/* Tools */}
        <button onClick={() => {
          const s = prompt("Suchen:");
          if (s) {
            const selection = window.getSelection();
            const range = document.createRange();
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null
            );
            let node;
            while ((node = walker.nextNode())) {
              if (node.textContent?.includes(s)) {
                range.selectNodeContents(node);
                selection?.removeAllRanges();
                selection?.addRange(range);
                break;
              }
            }
          }
        }} style={buttonStyle}>🔍</button>
        <button onClick={handlePrint} style={{ ...buttonStyle, backgroundColor: '#2c3e50', color: 'white' }}>🖨️ PDF</button>
        <button 
          onClick={() => ordoFileService.export(inhalt)}
          title="Als .ordo Datei speichern"
          style={buttonStyle}
        >
          💾 .ordo Export
        </button>
      </div>

      {/* --- SCHREIBBEREICH --- */}
      <div style={{ padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }} className="printable-area">
        <div style={paperStyle}>
          <input 
            type="text" 
            value={titel}
            onChange={(e) => onTitelChange(e.target.value)}
            placeholder={document.typ === 'gottesdienst' ? "Titel des Gottesdienstes..." : "Titel der Notiz..."}
            style={titelInputStyle}
          />

          <div 
            contentEditable 
            spellCheck="true"
            suppressContentEditableWarning
            onInput={(e) => onInhaltChange(e.currentTarget.innerHTML)}
            onBlur={onSpeichern}
            dangerouslySetInnerHTML={{ __html: inhalt }}
            style={editorAreaStyle}
          />
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const toolbarStyle: React.CSSProperties = { 
  display: 'flex', 
  gap: '5px', 
  padding: '8px 20px', 
  background: '#f8f9fa', 
  borderBottom: '1px solid #ddd', 
  flexWrap: 'wrap',
  alignItems: 'center'
};

const sep = { width: '1px', height: '20px', background: '#ccc', margin: '0 5px' };

const buttonStyle = {
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
};

const selectStyle = {
  padding: '5px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  backgroundColor: 'white',
  cursor: 'pointer'
};

const colorStyle = {
  width: '30px',
  height: '30px',
  padding: '0',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer'
};

const paperStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '850px',
  backgroundColor: 'white',
  padding: '60px 80px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  minHeight: '1100px' // A4 Proportion
};

const titelInputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: '2.5rem',
  border: 'none',
  outline: 'none',
  marginBottom: '30px',
  color: '#2c3e50',
  fontWeight: 'bold'
};

const editorAreaStyle: React.CSSProperties = {
  minHeight: '800px',
  outline: 'none',
  fontSize: '1.2rem',
  lineHeight: '1.7',
  color: '#333',
  textAlign: 'left'
};
