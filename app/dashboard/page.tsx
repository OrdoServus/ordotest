'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs, addDoc, onSnapshot, QueryDocumentSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dokumente, setDokumente] = useState<Dokument[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchDokumente = async () => {
        try {
          const q = query(
            collection(db, 'users', user.uid, 'dokumente'),
            orderBy('datum', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const docs: Dokument[] = [];
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            docs.push({ id: doc.id, ...doc.data() } as Dokument);
          });
          setDokumente(docs);
        } catch (error) {
          console.error('Error fetching documents:', error);
        }
      };

      fetchDokumente();

      // Subscribe to changes
      const q = query(
        collection(db, 'users', user.uid, 'dokumente'),
        orderBy('datum', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const docs: Dokument[] = [];
        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          docs.push({ id: doc.id, ...doc.data() } as Dokument);
        });
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
      inhalt: isGottesdienst ? '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.' : '# Neue Notiz\n\n',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: typ,
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'dokumente'), neu);
      router.push(isGottesdienst ? `/gottesdienste?doc=${docRef.id}` : `/notizen?doc=${docRef.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };


  return (
    <Dashboard 
      dokumente={dokumente}
      onNeuGottesdienst={() => createNewDocument('gottesdienst')}
      onNeuNotiz={() => createNewDocument('notiz')}
    />
  );
}
