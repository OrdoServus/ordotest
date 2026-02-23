'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';

// Tools importieren
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// @ts-ignore
import Table from '@editorjs/table';
// @ts-ignore
import Marker from '@editorjs/marker'; // NEU: Leuchtstift importieren

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorProps {
  value: OutputData;
  onChange: (data: OutputData) => void;
  documentId?: string;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EMPTY_DATA: OutputData = { blocks: [] };

// ─── Komponente ───────────────────────────────────────────────────────────────

const Editor: React.FC<EditorProps> = ({ value, onChange, documentId }) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);

  // Ref, um den externen Wert zu verfolgen und unnötige Updates zu vermeiden
  const externalValueRef = useRef(value);

  // ── Editor initialisieren und zerstören ───────────────────────────────────

  useEffect(() => {
    if (!holderRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: 'Schreibe hier oder wähle eine Vorlage…',
      
      // Tools konfigurieren
      tools: {
        header: { class: Header, config: { levels: [1, 2, 3, 4], defaultLevel: 2 }, inlineToolbar: true },
        list:      { class: List,      inlineToolbar: true },
        quote:     { class: Quote,     inlineToolbar: true },
        delimiter: Delimiter,
        table:     { class: Table,     inlineToolbar: true },
        marker:    { class: Marker,    shortcut: 'CMD+SHIFT+M' }, // NEU: Leuchtstift hinzufügen
      },

      data: value && value.blocks && value.blocks.length > 0 ? value : EMPTY_DATA,

      onChange: async (api) => {
        const savedData = await api.saver.save();
        // Aktualisiere den externen Wert, um die Referenz synchron zu halten
        externalValueRef.current = savedData;
        onChange(savedData);
      },
    });

    editorRef.current = editor;

    // Cleanup-Funktion
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]); // Editor nur bei Dokumenten-Wechsel neu initialisieren


  // ── Externen Wert aktualisieren (z.B. durch Vorlagen) ────────────────────

  useEffect(() => {
    // Nur aktualisieren, wenn sich der Wert wirklich geändert hat
    if (editorRef.current && value !== externalValueRef.current) {
        // Vergleiche den Inhalt, nicht nur die Referenz
        if (JSON.stringify(value) !== JSON.stringify(externalValueRef.current)) {
            editorRef.current.render(value);
            externalValueRef.current = value;
        }
    }
  }, [value]);

  return (
    <>
      <style>{editorStyles}</style>
      <div ref={holderRef} />
    </>
  );
};


// ─── CSS ──────────────────────────────────────────────────────────────────────

const editorStyles = `
  /* ... Stile bleiben unverändert ... */
  .ce-block__content {
    max-width: 680px;
    font-family: 'Georgia', serif;
    color: #2c3e50;
    line-height: 1.8;
  }
  .ce-paragraph {
    font-family: 'Georgia', serif;
    font-size: 1rem;
    color: #2c3e50;
    line-height: 1.8;
  }
  .ce-header {
    font-family: 'Georgia', serif;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.25em;
  }
  .cdx-quote__text {
    font-family: 'Georgia', serif;
    font-style: italic;
    font-size: 1.05rem;
    border-left: 3px solid #80397B;
    padding-left: 16px;
    color: #555;
    min-height: 40px;
  }
  .cdx-quote__caption {
    font-family: 'Georgia', serif;
    font-size: 0.85rem;
    color: #888;
  }
  .ce-delimiter::before {
    content: '— · —';
    color: #bbb;
    letter-spacing: 0.4em;
    font-size: 1.1rem;
  }
  .cdx-list__item {
    font-family: 'Georgia', serif;
    font-size: 1rem;
    color: #2c3e50;
    line-height: 1.7;
  }
  .tc-table { border-collapse: collapse; width: 100%; }
  .tc-cell {
    border: 1px solid #dee2e6;
    padding: 8px 12px;
    font-family: 'Georgia', serif;
    font-size: 0.95rem;
  }
  .ce-toolbar__plus,
  .ce-toolbar__settings-btn {
    color: #aaa;
    transition: color 0.15s;
  }
  .ce-toolbar__plus:hover,
  .ce-toolbar__settings-btn:hover {
    color: #2c3e50;
    background: #f0f0f0;
  }
  .ce-inline-tool { color: #555; }
  .ce-inline-tool:hover,
  .ce-inline-tool--active { color: #80397B; background: #f9f0f8; }
  .ce-block--selected .ce-block__content {
    background: #f5f0ff;
    border-radius: 4px;
  }
  .ce-popover-item__title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 0.9rem;
  }
  .codex-editor { border: none; }
  /* CSS für Leuchtstift */
  .ce-toolbar__content .ce-inline-tool[data-tool="marker"],
  .ce-inline-toolbar .ce-inline-tool[data-tool="marker"] {
      width: 34px;
      height: 34px;
  }
  mark.cdx-marker {
      background-color: rgba(245, 235, 111, 0.29);
      padding: 3px 0;
  }
  @media print {
    .ce-toolbar { display: none !important; }
    .ce-block__content { max-width: 100% !important; }
  }
`;

export default Editor;
