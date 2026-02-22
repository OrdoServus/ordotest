'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorProps {
  /** Editor.js OutputData object from Firestore */
  value: OutputData;
  /** Called with OutputData when the user types */
  onChange: (data: OutputData) => void;
  /** ID of the current document */
  documentId?: string;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EMPTY_DATA: OutputData = { blocks: [] };

// ─── Komponente ───────────────────────────────────────────────────────────────

const Editor: React.FC<EditorProps> = ({ value, onChange, documentId }) => {
  const holderRef    = useRef<HTMLDivElement>(null);
  const editorRef    = useRef<EditorJS | null>(null);
  const currentDocId = useRef<string | undefined>(undefined);
  const isSilent     = useRef(false);
  const lastExtValue = useRef<OutputData>(value);

  // ── Editor initialisieren ─────────────────────────────────────────────────

  const initEditor = useCallback(async (data: OutputData) => {
    if (!holderRef.current) return;

    if (editorRef.current) {
      try {
        await editorRef.current.isReady;
        editorRef.current.destroy();
      } catch { /* ignorieren */ }
      editorRef.current = null;
    }

    isSilent.current = true;

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: 'Schreiben Sie hier oder wählen Sie eine Vorlage…',
      tools: {
        header: { class: Header, config: { levels: [1, 2, 3, 4], defaultLevel: 2 }, inlineToolbar: true },
        list:      { class: List,      inlineToolbar: true },
        quote:     { class: Quote,     inlineToolbar: true },
        delimiter: Delimiter,
        table:     { class: Table,     inlineToolbar: true },
      },
      data: data,
      onChange: async (api) => {
        if (isSilent.current) return;
        try {
          const savedData = await api.saver.save();
          lastExtValue.current = savedData;
          onChange(savedData);
        } catch { /* ignorieren */ }
      },
    });

    editorRef.current = editor;

    try {
      await editor.isReady;
    } finally {
      isSilent.current = false;
    }
  }, [onChange]);

  // ── Mount & Dokument-Wechsel ──────────────────────────────────────────────

  useEffect(() => {
    const dataToLoad = value && value.blocks?.length > 0 ? value : EMPTY_DATA;
    initEditor(dataToLoad);
    currentDocId.current = documentId;
    lastExtValue.current = dataToLoad;
  }, [documentId, initEditor]); // Re-init on document change

  // ── Extern geänderter Wert (z.B. Vorlage) ──────────────────────────────────

  useEffect(() => {
    if (value === lastExtValue.current || documentId !== currentDocId.current) return;
    
    lastExtValue.current = value;
    if (!editorRef.current?.isReady) return;

    editorRef.current.isReady
      .then(() => {
        isSilent.current = true;
        return editorRef.current!.render(value && value.blocks?.length ? value : EMPTY_DATA);
      })
      .then(() => { isSilent.current = false; })
      .catch(() => { isSilent.current = false; });

  }, [value, documentId]);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try { editorRef.current.destroy(); } catch {}
      }
      editorRef.current = null;
    };
  }, []);

  return (
    <>
      <style>{editorStyles}</style>
      <div ref={holderRef} />
    </>
  );
};


// ─── CSS ──────────────────────────────────────────────────────────────────────

const editorStyles = `
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
  @media print {
    .ce-toolbar { display: none !important; }
    .ce-block__content { max-width: 100% !important; }
  }
`;

export default Editor;
