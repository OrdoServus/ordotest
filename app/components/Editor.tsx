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
// @ts-ignore
import edjsHTML from 'editorjs-html';

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorProps {
  /** HTML-String aus Firestore oder Vorlage */
  value: string;
  /** Wird mit HTML-String aufgerufen wenn der Nutzer etwas schreibt */
  onChange: (html: string) => void;
  /**
   * ID des aktuellen Dokuments.
   * Wenn sich diese ändert, wird der Editor mit neuem Inhalt neu geladen.
   */
  documentId?: string;
}

// ─── Konverter ────────────────────────────────────────────────────────────────

const outputToHtml = (data: OutputData): string => {
  try {
    const parser = edjsHTML();
    return parser.parse(data).join('');
  } catch {
    return '';
  }
};

/**
 * HTML → EditorJS blocks
 * Eigener DOM-Parser – kein html-to-editorjs Paket nötig.
 * Unterstützt alle OrdoServus-Vorlagen: h1–h4, p, ul, ol, blockquote, hr, table.
 */
const htmlToOutput = (html: string): OutputData => {
  if (!html?.trim() || typeof window === 'undefined') return { blocks: [] };

  const div = document.createElement('div');
  div.innerHTML = html;
  const blocks: any[] = [];

  div.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: 'paragraph', data: { text } });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const inner = el.innerHTML.trim();
    const text = el.textContent?.trim() ?? '';

    if (!text && !inner) return;

    switch (tag) {
      case 'h1': blocks.push({ type: 'header', data: { text: inner, level: 1 } }); break;
      case 'h2': blocks.push({ type: 'header', data: { text: inner, level: 2 } }); break;
      case 'h3': blocks.push({ type: 'header', data: { text: inner, level: 3 } }); break;
      case 'h4': blocks.push({ type: 'header', data: { text: inner, level: 4 } }); break;
      case 'ul': {
        const items = Array.from(el.querySelectorAll(':scope > li')).map(li => li.innerHTML.trim());
        if (items.length) blocks.push({ type: 'list', data: { style: 'unordered', items } });
        break;
      }
      case 'ol': {
        const items = Array.from(el.querySelectorAll(':scope > li')).map(li => li.innerHTML.trim());
        if (items.length) blocks.push({ type: 'list', data: { style: 'ordered', items } });
        break;
      }
      case 'blockquote':
        blocks.push({ type: 'quote', data: { text: inner, caption: '', alignment: 'left' } });
        break;
      case 'hr':
        blocks.push({ type: 'delimiter', data: {} });
        break;
      case 'table': {
        const rows = Array.from(el.querySelectorAll('tr')).map(row =>
          Array.from(row.querySelectorAll('td, th')).map(cell => cell.innerHTML.trim())
        );
        if (rows.length) blocks.push({ type: 'table', data: { withHeadings: false, content: rows } });
        break;
      }
      default:
        if (inner) blocks.push({ type: 'paragraph', data: { text: inner } });
    }
  });

  return { blocks };
};

// ─── Komponente ───────────────────────────────────────────────────────────────

const Editor: React.FC<EditorProps> = ({ value, onChange, documentId }) => {
  const holderRef      = useRef<HTMLDivElement>(null);
  const editorRef      = useRef<EditorJS | null>(null);
  const currentDocId   = useRef<string | undefined>(undefined);
  // Stumm-Flag: kein onChange-Call während wir Inhalt laden
  const isSilent       = useRef(false);
  // Letzter von außen gesetzter Wert
  const lastExtValue   = useRef<string>(value);

  // ── Editor initialisieren ─────────────────────────────────────────────────

  const initEditor = useCallback(async (html: string) => {
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
        header: {
          class: Header,
          config: { levels: [1, 2, 3, 4], defaultLevel: 2 },
          inlineToolbar: true,
        },
        list:      { class: List,      inlineToolbar: true },
        quote:     { class: Quote,     inlineToolbar: true },
        delimiter: Delimiter,
        table:     { class: Table,     inlineToolbar: true },
      },
      data: htmlToOutput(html),
      onChange: async (api) => {
        if (isSilent.current) return;
        try {
          const saved = await api.saver.save();
          const result = outputToHtml(saved);
          lastExtValue.current = result;
          onChange(result);
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

  // ── Mount ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    initEditor(value);
    currentDocId.current = documentId;
    lastExtValue.current = value;

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dokument gewechselt ───────────────────────────────────────────────────

  useEffect(() => {
    if (documentId === undefined || documentId === currentDocId.current) return;
    currentDocId.current = documentId;
    lastExtValue.current = value;
    initEditor(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // ── Template von aussen angewendet (selbes Dokument, neuer HTML-Inhalt) ──

  useEffect(() => {
    if (value === lastExtValue.current) return;
    if (documentId !== currentDocId.current) return;
    lastExtValue.current = value;

    if (!editorRef.current) return;
    editorRef.current.isReady
      .then(() => {
        isSilent.current = true;
        return editorRef.current!.render(htmlToOutput(value));
      })
      .then(() => { isSilent.current = false; })
      .catch(() => { isSilent.current = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
