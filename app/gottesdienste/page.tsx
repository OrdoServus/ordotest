'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../login/firebaseClient';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp, query, orderBy, where } from "firebase/firestore";

import Sidebar from '../components/Sidebar';
import GottesdienstEditor from '../components/GottesdienstEditor'; // Geändert

// TypeScript-Interfaces
interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

export default function GottesdienstePage() {
  const user = { uid: 'test-user-id' };
  const searchParams = useSearchParams();

  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [aktuelleId, setAktuelleId] = useState<string | null>(null);

  useEffect(() => {
    const docId = searchParams.get('doc');
    if (docId) {
      setAktuelleId(docId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
      const q = query(userDocsCollection, where("typ", "==", "gottesdienst"), orderBy('datum', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Dokument, 'id'>) }));
        setDokumente(docs);
        if (!aktuelleId && docs.length > 0 && !searchParams.get('doc')) {
          // setAktuelleId(docs[0].id);
        }
      });
      return () => unsubscribe();
    } else {
      setDokumente([]);
    }
  }, [user, aktuelleId, searchParams]);

  const aktuellesDoc = dokumente.find(d => d.id === aktuelleId);

  const handleUpdate = useCallback(async (feld: 'titel' | 'inhalt', wert: string) => {
    if (!user || !aktuelleId) return;
    const docRef = doc(db, 'users', user.uid, 'dokumente', aktuelleId);
    await updateDoc(docRef, { [feld]: wert });
  }, [user, aktuelleId]);

  const erstelleNeuenGottesdienst = async () => {
    if (!user) return;
    const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
    const neu = {
      titel: 'Neuer Gottesdienst',
      inhalt: '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.',
      datum: serverTimestamp(),
      isFavorit: false,
      typ: 'gottesdienst' as const,
    };
    const newDocRef = await addDoc(userDocsCollection, neu);
    setAktuelleId(newDocRef.id);
  };

  const handleLöschen = async (id: string) => {
    if (!user || !confirm("Möchten Sie diesen Gottesdienst wirklich endgültig löschen?")) return;
    const docRef = doc(db, 'users', user.uid, 'dokumente', id);
    await deleteDoc(docRef);
    if (aktuelleId === id) setAktuelleId(null);
  };

  const handleKopieren = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'dokumente', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const original = docSnap.data();
      const kopie = { ...original, titel: `${original.titel} (Kopie)`, datum: serverTimestamp() };
      const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
      await addDoc(userDocsCollection, kopie);
    }
  };

  const handleFavorit = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'dokumente', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { isFavorit: !docSnap.data().isFavorit });
    }
  };

  return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
        <Sidebar
          dokumente={dokumente}
          aktuelleId={aktuelleId}
          onWähleDokument={setAktuelleId}
          onNeuGottesdienst={erstelleNeuenGottesdienst}
          onNeuNotiz={() => {}} // No-op
          onLöschen={handleLöschen}
          onKopieren={handleKopieren}
          onFavorit={handleFavorit}
          docType='gottesdienst'
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {aktuelleId && aktuellesDoc ? (
            <GottesdienstEditor // Geändert
              key={aktuelleId}
              titel={aktuellesDoc.titel}
              inhalt={aktuellesDoc.inhalt}
              onTitelChange={(w) => handleUpdate('titel', w)}
              onInhaltChange={(w) => handleUpdate('inhalt', w)}
              onSpeichern={() => {}}
              document={aktuellesDoc}
            />
          ) : (
            <div style={{textAlign: 'center', padding: '50px', color: '#7f8c8d'}}>
                <h2>Gottesdienst auswählen</h2>
                <p>Bitte wählen Sie einen Gottesdienst aus der Liste oder erstellen Sie einen neuen.</p>
            </div>
          )}
        </div>
      </div>
  );
}
