'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { db } from './firebase/config';
import { collection, query, where, orderBy, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

import Dashboard from './components/Dashboard';

interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

// Cache für Dokumente (session-basiert)
const documentCache = new Map<string, { data: Dokument[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten Cache

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/info');
    }
  }, [user, loading, router]);

  // Optimierte Datenladung mit Caching
  const fetchDokumente = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    // Verhindere parallele Requests
    if (isFetchingRef.current) return;
    
    const cacheKey = user.uid;
    const now = Date.now();
    
    // Prüfe Cache (außer bei forceRefresh)
    if (!forceRefresh) {
      const cached = documentCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('📦 Using cached documents');
        setDokumente(cached.data);
        setIsLoading(false);
        return;
      }
    }

    // Rate Limiting: Mindestens 10 Sekunden zwischen Requests
    if (!forceRefresh && (now - lastFetchRef.current) < 10000) {
      console.log('⏳ Rate limited, skipping fetch');
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const q = query(
        collection(db, 'users', user.uid, 'dokumente'),
        orderBy('datum', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dokument[];

      // Update Cache
      documentCache.set(cacheKey, { data: docs, timestamp: now });
      setDokumente(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchDokumente();
    }
  }, [user, fetchDokumente]);

  // Manuelle Aktualisierung nur bei Bedarf (z.B. nach Erstellung)
  const refreshData = useCallback(() => {
    fetchDokumente(true);
  }, [fetchDokumente]);

  // Optimierte Dokumenterstellung mit local state update
  const createNewDocument = useCallback(async (typ: 'gottesdienst' | 'notiz') => {
    if (!user) return;
    
    const isGottesdienst = typ === 'gottesdienst';
    const newDoc = {
      user_id: user.uid,
      titel: isGottesdienst ? 'Neuer Gottesdienst' : 'Neue Notiz',
      inhalt: isGottesdienst ? '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.' : '# Neue Notiz\n\n',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: typ,
      createdAt: serverTimestamp(),
    };

    try {
      // Erstelle Dokument in Firestore
      const docRef = doc(collection(db, 'users', user.uid, 'dokumente'));
      await setDoc(docRef, newDoc);
      
      // Lokales Update ohne neuen Fetch (spart Lesekosten!)
      const createdDoc = { ...newDoc, id: docRef.id } as Dokument;
      setDokumente(prev => [createdDoc, ...prev]);
      
      // Cache aktualisieren
      const cacheKey = user.uid;
      const cached = documentCache.get(cacheKey);
      if (cached) {
        documentCache.set(cacheKey, { 
          data: [createdDoc, ...cached.data], 
          timestamp: Date.now() 
        });
      }
      
      router.push(isGottesdienst ? `/gottesdienste?doc=${docRef.id}` : `/notizen?doc=${docRef.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  }, [user, router]);

  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem' }}>Lade App...</div>;
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem' }}>Lade Dokumente...</div>;
  }

  return (
    <Dashboard 
      dokumente={dokumente}
      onNeuGottesdienst={() => createNewDocument('gottesdienst')}
      onNeuNotiz={() => createNewDocument('notiz')}
    />
  );

}
