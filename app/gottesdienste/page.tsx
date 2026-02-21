'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { useAuth } from '../AuthContext';
import { collection, query, where, orderBy, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import Sidebar from '../components/Sidebar';
import GottesdienstEditor from '../components/GottesdienstEditor';

// TypeScript-Interfaces
interface Dokument {
  id: string;
  titel: string;
  inhalt: string;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
}

// Cache für Gottesdienste
const gottesdienstCache = new Map<string, { data: Dokument[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten

export default function GottesdienstePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [aktuelleId, setAktuelleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const docId = searchParams.get('doc');
    if (docId) {
      setAktuelleId(docId);
    }
  }, [searchParams]);

  // Optimierte Datenladung mit Caching
  const fetchDokumente = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    if (isFetchingRef.current) return;
    
    const cacheKey = user.uid;
    const now = Date.now();
    
    // Cache prüfen
    if (!forceRefresh) {
      const cached = gottesdienstCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('📦 Using cached gottesdienste');
        setDokumente(cached.data);
        setIsLoading(false);
        return;
      }
    }

    // Rate Limiting
    if (!forceRefresh && (now - lastFetchRef.current) < 10000) {
      console.log('⏳ Rate limited');
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const q = query(
        collection(db, 'users', user.uid, 'dokumente'),
        where('typ', '==', 'gottesdienst'),
        orderBy('datum', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Dokument[];

      gottesdienstCache.set(cacheKey, { data: docs, timestamp: now });
      setDokumente(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDokumente();
    }
  }, [user, fetchDokumente]);

  // Debounced Update Funktion
  const handleUpdate = useCallback(async (feld: 'titel' | 'inhalt', wert: string) => {
    if (!user || !aktuelleId) return;
    
    // Lokales Update sofort (optimistisch)
    setDokumente(prev => prev.map(d => 
      d.id === aktuelleId ? { ...d, [feld]: wert } : d
    ));

    // In pending queue speichern
    const key = `${aktuelleId}_${feld}`;
    pendingUpdatesRef.current.set(key, { feld, wert, timestamp: Date.now() });

    // Debounced Firestore Update (500ms)
    setTimeout(async () => {
      const update = pendingUpdatesRef.current.get(key);
      if (update && update.wert === wert) {
        try {
          const docRef = doc(db, 'users', user.uid, 'dokumente', aktuelleId);
          await updateDoc(docRef, { [feld]: wert });
          pendingUpdatesRef.current.delete(key);
        } catch (error) {
          console.error('Error updating document:', error);
        }
      }
    }, 500);
  }, [user, aktuelleId]);

  const aktuellesDoc = dokumente.find(d => d.id === aktuelleId);

  const erstelleNeuenGottesdienst = useCallback(async () => {
    if (!user) return;
    
    const newDoc = {
      user_id: user.uid,
      titel: 'Neuer Gottesdienst',
      inhalt: '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: 'gottesdienst',
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = doc(collection(db, 'users', user.uid, 'dokumente'));
      await setDoc(docRef, newDoc);
      
      const createdDoc = { ...newDoc, id: docRef.id } as Dokument;
      setDokumente(prev => [createdDoc, ...prev]);
      setAktuelleId(docRef.id);
      
      // Cache aktualisieren
      const cacheKey = user.uid;
      const cached = gottesdienstCache.get(cacheKey);
      if (cached) {
        gottesdienstCache.set(cacheKey, { 
          data: [createdDoc, ...cached.data], 
          timestamp: Date.now() 
        });
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  }, [user]);

  const handleLöschen = useCallback(async (id: string) => {
    if (!user || !confirm("Möchten Sie diesen Gottesdienst wirklich endgültig löschen?")) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'dokumente', id));
      
      // Lokales Update
      setDokumente(prev => prev.filter(d => d.id !== id));
      if (aktuelleId === id) setAktuelleId(null);
      
      // Cache aktualisieren
      const cacheKey = user.uid;
      const cached = gottesdienstCache.get(cacheKey);
      if (cached) {
        gottesdienstCache.set(cacheKey, {
          data: cached.data.filter(d => d.id !== id),
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }, [user, aktuelleId]);

  const handleKopieren = useCallback(async (id: string) => {
    if (!user) return;
    
    const original = dokumente.find(d => d.id === id);
    if (!original) return;

    const kopie = {
      user_id: user.uid,
      titel: `${original.titel} (Kopie)`,
      inhalt: original.inhalt,
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: 'gottesdienst',
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = doc(collection(db, 'users', user.uid, 'dokumente'));
      await setDoc(docRef, kopie);
      
      const createdDoc = { ...kopie, id: docRef.id } as Dokument;
      setDokumente(prev => [createdDoc, ...prev]);
      
      // Cache aktualisieren
      const cacheKey = user.uid;
      const cached = gottesdienstCache.get(cacheKey);
      if (cached) {
        gottesdienstCache.set(cacheKey, {
          data: [createdDoc, ...cached.data],
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error copying document:', error);
    }
  }, [user, dokumente]);

  const handleFavorit = useCallback(async (id: string) => {
    if (!user) return;
    
    const dokument = dokumente.find(d => d.id === id);
    if (!dokument) return;

    const newFavorit = !dokument.isFavorit;

    // Lokales Update sofort
    setDokumente(prev => prev.map(d => 
      d.id === id ? { ...d, isFavorit: newFavorit } : d
    ));

    try {
      const docRef = doc(db, 'users', user.uid, 'dokumente', id);
      await updateDoc(docRef, { isFavorit: newFavorit });
      
      // Cache aktualisieren
      const cacheKey = user.uid;
      const cached = gottesdienstCache.get(cacheKey);
      if (cached) {
        gottesdienstCache.set(cacheKey, {
          data: cached.data.map(d => d.id === id ? { ...d, isFavorit: newFavorit } : d),
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      // Rollback bei Fehler
      setDokumente(prev => prev.map(d => 
        d.id === id ? { ...d, isFavorit: !newFavorit } : d
      ));
    }
  }, [user, dokumente]);

  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Lade...</div>;
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Lade Gottesdienste...</div>;
  }

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
          <GottesdienstEditor
            key={aktuelleId}
            document={aktuellesDoc}
            onTitelChange={(w) => handleUpdate('titel', w)}
            onInhaltChange={(w) => handleUpdate('inhalt', w)}
            onSpeichern={() => {}} // This is likely not needed due to autosave
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
