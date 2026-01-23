"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [dokumente, setDokumente] = useState<any[]>([]);
  const [aktuelleId, setAktuelleId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const daten = localStorage.getItem('ordoservus_v2');
    if (daten) {
      setDokumente(JSON.parse(daten));
    }
  }, []);

  // Hilfsfunktion zum Speichern der gesamten Liste
  const speichereAlles = (neueListe: any[]) => {
    setDokumente(neueListe);
    localStorage.setItem('ordoservus_v2', JSON.stringify(neueListe));
  };

  const aktuellesDoc = dokumente.find(d => d.id === aktuelleId);

  const handleUpdate = (feld: 'titel' | 'inhalt', wert: string) => {
    const neueListe = dokumente.map(d => 
      d.id === aktuelleId ? { ...d, [feld]: wert } : d
    );
    speichereAlles(neueListe);
  };

  const erstelleNeues = () => {
    const neu = {
      id: Date.now().toString(),
      titel: 'Neuer Gottesdienst',
      inhalt: '',
      datum: new Date().toLocaleDateString(),
      isFavorit: false,
      typ: 'gottesdienst'
    };
    speichereAlles([neu, ...dokumente]);
    setAktuelleId(neu.id);
  };

  const handleLöschen = (id: string) => {
    if (confirm("Möchten Sie diesen Dienst wirklich löschen?")) {
      const neueListe = dokumente.filter(d => d.id !== id);
      speichereAlles(neueListe);
      if (aktuelleId === id) setAktuelleId(null);
    }
  };

  const handleKopieren = (id: string) => {
    const original = dokumente.find(d => d.id === id);
    if (original) {
      const kopie = { 
        ...original, 
        id: Date.now().toString(), 
        titel: `${original.titel} (Kopie)`,
        datum: new Date().toLocaleDateString() 
      };
      speichereAlles([kopie, ...dokumente]);
    }
  };

  const handleFavorit = (id: string) => {
    const neueListe = dokumente.map(d => 
      d.id === id ? { ...d, isFavorit: !d.isFavorit } : d
    );
    speichereAlles(neueListe);
  };

  if (!isClient) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fff' }}>
      <Sidebar 
        dokumente={dokumente} 
        aktuelleId={aktuelleId} 
        onWähleDokument={setAktuelleId} 
        onNeu={erstelleNeues}
        onLöschen={handleLöschen} 
        onKopieren={handleKopieren}
        onFavorit={handleFavorit}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {aktuelleId && aktuellesDoc ? (
          <Editor
            titel={aktuellesDoc.titel}
            inhalt={aktuellesDoc.inhalt}
            onTitelChange={(w) => handleUpdate('titel', w)}
            onInhaltChange={(w) => handleUpdate('inhalt', w)}
            onSpeichern={() => {}}
            document={aktuellesDoc}
          />
        ) : (
          <Dashboard 
            dokumente={dokumente} 
            onWähleDokument={setAktuelleId} 
            onNeu={erstelleNeues} 
          />
        )}
      </div>
    </div>
  );
}