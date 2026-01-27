import React from 'react';
import { VORLAGEN } from './vorlagen';

interface VorlagenMenuProps {
  onVorlageWählen: (inhalt: string) => void;
}

export default function VorlagenMenu({ onVorlageWählen }: VorlagenMenuProps) {
  const handleVorlage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wahl = e.target.value as keyof typeof VORLAGEN;
    if (wahl && VORLAGEN[wahl]) {
      if (confirm("Möchten Sie diese Vorlage laden? Ihr aktueller Text wird ersetzt.")) {
        onVorlageWählen(VORLAGEN[wahl]);
      }
    }
    e.target.value = ""; // Reset Auswahl
  };

  return (
    <select onChange={handleVorlage} style={selectStyle}>
      <option value="">📄 Vorlage...</option>
      <option value="messe">Heilige Messe</option>
      <option value="andacht">Andacht</option>
      <option value="taufe">Taufe</option>
    </select>
  );
}

const selectStyle = {
  padding: '5px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  backgroundColor: 'white',
  cursor: 'pointer'
};