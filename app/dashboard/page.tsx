'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../login/firebaseClient';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import Dashboard from '../components/Dashboard';

interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

export default function DashboardPage() {
  const user = { uid: 'test-user-id' }; // Mock user
  const router = useRouter();
  const [dokumente, setDokumente] = useState<Dokument[]>([]);

  useEffect(() => {
    if (user) {
      const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
      const q = query(userDocsCollection, orderBy('datum', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Dokument, 'id'>) }));
        setDokumente(docs);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const createNewDocument = async (typ: 'gottesdienst' | 'notiz') => {
    if (!user) return;
    const userDocsCollection = collection(db, 'users', user.uid, 'dokumente');
    const isGottesdienst = typ === 'gottesdienst';
    const neu = {
      titel: isGottesdienst ? 'Neuer Gottesdienst' : 'Neue Notiz',
      inhalt: isGottesdienst ? '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.' : '# Neue Notiz\n\n',
      datum: serverTimestamp(),
      isFavorit: false,
      typ: typ,
    };
    const newDocRef = await addDoc(userDocsCollection, neu);
    // Redirect to the appropriate page to edit the new document
    router.push(isGottesdienst ? `/gottesdienste?doc=${newDocRef.id}` : `/notizen?doc=${newDocRef.id}`);
  };

  return (
    <Dashboard 
      dokumente={dokumente}
      onNeuGottesdienst={() => createNewDocument('gottesdienst')}
      onNeuNotiz={() => createNewDocument('notiz')}
    />
  );
}
