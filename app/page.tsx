'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { db } from './login/firebaseClient'; // Import db instance
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dokumente, setDokumente] = useState<any[]>([]);
  const [aktuelleId, setAktuelleId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/info'); // Changed to /info
    }
  }, [user, loading, router]);

  // Fetch data from Firestore in real-time
  useEffect(() => {
    if (user) {
      const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
      const q = query(userDocsCollection, orderBy('datum', 'desc')); // Order by date descending

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDokumente(docs);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      setDokumente([]); // Clear data if user logs out
    }
  }, [user]);

  const aktuellesDoc = dokumente.find(d => d.id === aktuelleId);

  const handleUpdate = useCallback(async (feld: 'titel' | 'inhalt', wert: string) => {
      if (!user || !aktuelleId) return;
      const docRef = doc(db, 'users', user.uid, 'dokumente', aktuelleId);
      await updateDoc(docRef, { [feld]: wert });
  }, [user, aktuelleId]);

  const erstelleNeues = async () => {
    if (!user) return;
    const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
    const neu = {
      titel: 'Neuer Gottesdienst',
      inhalt: '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.',
      datum: serverTimestamp(),
      isFavorit: false,
      typ: 'gottesdienst'
    };
    const newDocRef = await addDoc(userDocsCollection, neu);
    setAktuelleId(newDocRef.id);
  };

  const handleLöschen = async (id: string) => {
    if (!user) return;
    if (confirm("Möchten Sie diesen Dienst wirklich endgültig löschen?")) {
      const docRef = doc(db, 'users', user.uid, 'dokumente', id);
      await deleteDoc(docRef);
      if (aktuelleId === id) setAktuelleId(null);
    }
  };

  const handleKopieren = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'dokumente', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const original = docSnap.data();
      const kopie = {
        ...original,
        titel: `${original.titel} (Kopie)`,
        datum: serverTimestamp()
      };
      const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
      await addDoc(userDocsCollection, kopie);
    }
  };

  const handleFavorit = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'dokumente', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const currentFavStatus = docSnap.data().isFavorit;
        await updateDoc(docRef, { isFavorit: !currentFavStatus });
    }
  };

  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem' }}>Lade App...</div>;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 50px)', backgroundColor: '#fff' }}>
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
            key={aktuelleId}
            titel={aktuellesDoc.titel}
            inhalt={aktuellesDoc.inhalt}
            onTitelChange={(w) => handleUpdate('titel', w)}
            onInhaltChange={(w) => handleUpdate('inhalt', w)}
            onSpeichern={() => {}} // Pass empty function to satisfy prop requirement
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