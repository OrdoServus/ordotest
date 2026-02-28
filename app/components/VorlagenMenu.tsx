'use client';
import React from 'react';
import { OutputData } from '@editorjs/editorjs';

// ── Vorlagen als natives EditorJS-OutputData-Format ───────────────────────────
// (Der alte Code lieferte HTML-Strings – das führte zu einem Typ-Mismatch mit
// dem Editor, der OutputData erwartet.)

const VORLAGEN: Record<string, OutputData> = {
  messe: {
    blocks: [
      { id: 'h1', type: 'header',    data: { text: 'Heilige Messe', level: 2 } },
      { id: 'p1', type: 'paragraph', data: { text: '<b>Einzug:</b> ' } },
      { id: 'p2', type: 'paragraph', data: { text: '<b>Kyrie:</b> ' } },
      { id: 'p3', type: 'paragraph', data: { text: '<b>Gloria:</b> ' } },
      { id: 'p4', type: 'paragraph', data: { text: '<b>Tagesgebet:</b> ' } },
      { id: 'p5', type: 'paragraph', data: { text: '<b>1. Lesung:</b> ' } },
      { id: 'p6', type: 'paragraph', data: { text: '<b>Antwortpsalm:</b> ' } },
      { id: 'p7', type: 'paragraph', data: { text: '<b>2. Lesung:</b> ' } },
      { id: 'p8', type: 'paragraph', data: { text: '<b>Evangelium:</b> ' } },
      { id: 'p9', type: 'paragraph', data: { text: '<b>Predigt / Homilie:</b> ' } },
      { id: 'p10', type: 'paragraph', data: { text: '<b>Credo:</b> ' } },
      { id: 'p11', type: 'paragraph', data: { text: '<b>Fürbitten:</b> ' } },
      { id: 'p12', type: 'paragraph', data: { text: '<b>Gabenbereitung:</b> ' } },
      { id: 'p13', type: 'paragraph', data: { text: '<b>Eucharistisches Hochgebet:</b> ' } },
      { id: 'p14', type: 'paragraph', data: { text: '<b>Kommunion:</b> ' } },
      { id: 'p15', type: 'paragraph', data: { text: '<b>Schlussgebet & Segen:</b> ' } },
    ],
  },
  andacht: {
    blocks: [
      { id: 'h1', type: 'header',    data: { text: 'Andacht / Gebetsstunde', level: 2 } },
      { id: 'p1', type: 'paragraph', data: { text: '<b>Eröffnung:</b> ' } },
      { id: 'p2', type: 'paragraph', data: { text: '<b>Eröffnungslied:</b> ' } },
      { id: 'p3', type: 'paragraph', data: { text: '<b>Impuls / Lesung:</b> ' } },
      { id: 'p4', type: 'paragraph', data: { text: '<b>Stille:</b> ' } },
      { id: 'p5', type: 'paragraph', data: { text: '<b>Gebet / Fürbitten:</b> ' } },
      { id: 'p6', type: 'paragraph', data: { text: '<b>Vaterunser:</b> ' } },
      { id: 'p7', type: 'paragraph', data: { text: '<b>Segen:</b> ' } },
    ],
  },
  taufe: {
    blocks: [
      { id: 'h1', type: 'header',    data: { text: 'Tauffeier', level: 2 } },
      { id: 'p1', type: 'paragraph', data: { text: '<b>Begrüßung & Einführung:</b> ' } },
      { id: 'p2', type: 'paragraph', data: { text: '<b>Wortgottesdienst:</b> ' } },
      { id: 'p3', type: 'paragraph', data: { text: '<b>Taufversprechen:</b> ' } },
      { id: 'p4', type: 'paragraph', data: { text: '<b>Taufwasserweihe:</b> ' } },
      { id: 'p5', type: 'paragraph', data: { text: '<b>Taufspendung:</b> ' } },
      { id: 'p6', type: 'paragraph', data: { text: '<b>Salbung & weißes Gewand:</b> ' } },
      { id: 'p7', type: 'paragraph', data: { text: '<b>Taufkerze:</b> ' } },
      { id: 'p8', type: 'paragraph', data: { text: '<b>Abschluss & Segen:</b> ' } },
    ],
  },
  beerdigung: {
    blocks: [
      { id: 'h1', type: 'header',    data: { text: 'Begräbnisfeier', level: 2 } },
      { id: 'p1', type: 'paragraph', data: { text: '<b>Empfang des Sarges / Begrüßung:</b> ' } },
      { id: 'p2', type: 'paragraph', data: { text: '<b>Einzug:</b> ' } },
      { id: 'p3', type: 'paragraph', data: { text: '<b>Eröffnungsgebet:</b> ' } },
      { id: 'p4', type: 'paragraph', data: { text: '<b>Lesung:</b> ' } },
      { id: 'p5', type: 'paragraph', data: { text: '<b>Evangelium:</b> ' } },
      { id: 'p6', type: 'paragraph', data: { text: '<b>Homilie:</b> ' } },
      { id: 'p7', type: 'paragraph', data: { text: '<b>Fürbitten:</b> ' } },
      { id: 'p8', type: 'paragraph', data: { text: '<b>Abschlussgebete:</b> ' } },
      { id: 'p9', type: 'paragraph', data: { text: '<b>Segen & Auszug:</b> ' } },
    ],
  },
};

interface VorlagenMenuProps {
  onVorlageWählen: (inhalt: OutputData) => void;
}

export default function VorlagenMenu({ onVorlageWählen }: VorlagenMenuProps) {
  const handleVorlage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wahl = e.target.value as keyof typeof VORLAGEN;
    if (wahl && VORLAGEN[wahl]) {
      if (confirm('Vorlage laden? Der aktuelle Inhalt wird ersetzt.')) {
        onVorlageWählen(VORLAGEN[wahl]);
      }
    }
    e.target.value = '';
  };

  return (
    <select onChange={handleVorlage} style={selectStyle} title="Vorlage laden">
      <option value="">📄 Vorlage laden…</option>
      <option value="messe">Heilige Messe</option>
      <option value="andacht">Andacht / Gebetsstunde</option>
      <option value="taufe">Tauffeier</option>
      <option value="beerdigung">Begräbnisfeier</option>
    </select>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontSize: '0.875rem',
};
