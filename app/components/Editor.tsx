'use client';
import React, { useEffect, useRef } from 'react';
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
// @ts-ignore
import HTMLtoEditorJS from 'html-to-editorjs';

interface EditorProps {
  value: string; // Current value is HTML string
  onChange: (value: string) => void; // We'll pass back HTML string
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const htmlParser = new HTMLtoEditorJS();

  // Function to convert EditorJS JSON to HTML
  const toHtml = (data: OutputData): string => {
    const parser = edjsHTML();
    const htmlBlocks = parser.parse(data);
    return htmlBlocks.join('');
  };

  useEffect(() => {
    const initializeEditor = async () => {
        if (!editorRef.current && holderRef.current) {
            const initialData = value ? await htmlParser.parse(value) : { blocks: [] };

            const editor = new EditorJS({
                holder: holderRef.current,
                placeholder: 'Schreiben Sie hier Ihren Text oder wählen Sie eine Vorlage...',
                tools: {
                    header: Header,
                    list: List,
                    quote: Quote,
                    delimiter: Delimiter,
                    table: Table,
                },
                data: initialData,
                async onChange(api, event) {
                    const savedData = await api.saver.save();
                    const html = toHtml(savedData);
                    onChange(html);
                },
            });
            editorRef.current = editor;
        }
    };

    initializeEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, htmlParser]);

  return <div ref={holderRef} style={editorWrapperStyles}></div>;
};

const editorWrapperStyles: React.CSSProperties = {
    border: '1px solid #e8e8e8',
    borderRadius: '4px',
    padding: '20px',
    backgroundColor: '#fff',
    minHeight: '600px',
};

export default Editor;
