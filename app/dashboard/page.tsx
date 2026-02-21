'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, QuerySnapshot, DocumentData, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

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
  const { user, loading, userProfile } = useAuth(); // userProfile hier einbeziehen
  const router = useRouter();
  const [dokumente, setDokumente] = useState<Dokument[]>([]);

  // Redirect, wenn nicht eingeloggt
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Dokumente laden
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'dokumente'),
        orderBy('datum', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dokument));
        setDokumente(docs);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const createNewDocument = async (typ: 'gottesdienst' | 'notiz') => {
    if (!user) return;
    const isGottesdienst = typ === 'gottesdienst';
    const neu = {
      titel: isGottesdienst ? 'Neuer Gottesdienst' : 'Neue Notiz',
      inhalt: isGottesdienst ? '# Neuer Gottesdienst\n\n...' : '# Neue Notiz\n\n...',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: typ,
    };
    const docRef = await addDoc(collection(db, 'users', user.uid, 'dokumente'), neu);
    router.push(isGottesdienst ? `/gottesdienste?doc=${docRef.id}` : `/notizen?doc=${docRef.id}`);
  };

  // Ladeanzeige, bis Benutzerdaten und Profil vollständig geladen sind
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Profil wird geladen...</p>
      </div>
    );
  }

  // Dashboard rendern, wenn alles geladen ist
  return (
    <Dashboard 
      dokumente={dokumente}
      onNeuGottesdienst={() => createNewDocument('gottesdienst')}
      onNeuNotiz={() => createNewDocument('notiz')}
    />
  );
}

const styles: { [key: string]: React.CSSProperties } = {
    loadingContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f3f4', gap: '20px' },
    spinner: { width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #ef5c22', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    loadingText: { color: '#7f8c8d', fontSize: '1.1rem' },
};