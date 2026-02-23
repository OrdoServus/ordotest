'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { useAuth } from '../AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';
import { OutputData } from '@editorjs/editorjs';

import Sidebar from '../components/Sidebar';
import VorlagenMenu from '../components/VorlagenMenu';
const Editor = dynamic(() => import('../components/Editor'), { ssr: false });

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Dokument {
  id: string;
  titel: string;
  inhalt: OutputData;
  typ: 'gottesdienst' | 'notiz';
  isFavorit: boolean;
  datum: any;
  createdAt: any;
}

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

const EMPTY_INHALT: OutputData = { blocks: [] };

// ─── Komponente ───────────────────────────────────────────────────────────────

export default function GottesdienstePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dokumente, setDokumente] = useState<Dokument[]>([]);
  const [aktuelleId, setAktuelleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Refs für Debounce / Auto-Save
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTitelRef = useRef<string | null>(null);
  const pendingInhaltRef = useRef<OutputData | null>(null);
  const isSavingRef = useRef(false);

  // ── Auth-Guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // ── URL-Parameter ──────────────────────────────────────────────────────────
  useEffect(() => {
    const docId = searchParams.get('doc');
    if (docId) setAktuelleId(docId);
  }, [searchParams]);

  // ── Firestore: Dokumente laden (Echtzeit) ──────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'dokumente'),
      where('typ', '==', 'gottesdienst'),
      orderBy('datum', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Dokument[];
        setDokumente(docs);
        setIsLoading(false);
      },
      (error) => {
        console.error('Fehler beim Laden der Gottesdienste:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ── Speichern ─────────────────────────────────────────────────────────────

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!user || !aktuelleId) return false;
    if (pendingTitelRef.current === null && pendingInhaltRef.current === null) return true;
    if (isSavingRef.current) return false;

    isSavingRef.current = true;
    setSaveStatus('saving');

    const updates: Partial<Omit<Dokument, 'id'>> = {};
    if (pendingTitelRef.current !== null) updates.titel = pendingTitelRef.current;
    if (pendingInhaltRef.current !== null) updates.inhalt = pendingInhaltRef.current;

    try {
      await updateDoc(doc(db, 'users', user.uid, 'dokumente', aktuelleId), updates);
      pendingTitelRef.current = null;
      pendingInhaltRef.current = null;
      setSaveStatus('saved');

      setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setSaveStatus('error');
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [user, aktuelleId]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setSaveStatus('pending');
    autoSaveTimerRef.current = setTimeout(() => { saveNow(); }, 5000);
  }, [saveNow]);

  const handleWähleDokument = useCallback(async (id: string) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    await saveNow();
    setAktuelleId(id);
    router.push(`/gottesdienste?doc=${id}`, { scroll: false });
    setSaveStatus('idle');
  }, [saveNow, router]);

  // ── Felder aktualisieren ──────────────────────────────────────────────────

  const handleUpdateTitel = useCallback((wert: string) => {
    if (!aktuelleId) return;
    setDokumente((prev) => prev.map((d) => (d.id === aktuelleId ? { ...d, titel: wert } : d)));
    pendingTitelRef.current = wert;
    scheduleAutoSave();
  }, [aktuelleId, scheduleAutoSave]);

  const handleUpdateInhalt = useCallback((wert: OutputData) => {
    if (!aktuelleId) return;
    setDokumente((prev) => prev.map((d) => (d.id === aktuelleId ? { ...d, inhalt: wert } : d)));
    pendingInhaltRef.current = wert;
    scheduleAutoSave();
  }, [aktuelleId, scheduleAutoSave]);

  // ── Manuelles Speichern & Unload-Handler ───────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        saveNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingTitelRef.current !== null || pendingInhaltRef.current !== null) {
        saveNow();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [saveNow]);
  
  // ── CRUD ──────────────────────────────────────────────────────────────────

  const erstelleNeuenGottesdienst = useCallback(async () => {
    if (!user) return;

    const newDocData = {
      titel: 'Neuer Gottesdienst',
      inhalt: EMPTY_INHALT,
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: 'gottesdienst' as const,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'dokumente'), newDocData);
      handleWähleDokument(docRef.id);
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
    }
  }, [user, handleWähleDokument]);

  const handleLöschen = useCallback(async (id: string) => {
    if (!user || !confirm('Möchtest du diesen Gottesdienst wirklich endgültig löschen?')) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'dokumente', id));
      if (aktuelleId === id) {
        setAktuelleId(null);
        router.push('/gottesdienste', { scroll: false });
        setSaveStatus('idle');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  }, [user, aktuelleId, router]);

  const handleKopieren = useCallback(async (id: string) => {
    if (!user) return;
    const original = dokumente.find((d) => d.id === id);
    if (!original) return;

    const kopie = {
      titel: `${original.titel} (Kopie)`,
      inhalt: original.inhalt,
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: 'gottesdienst' as const,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'dokumente'), kopie);
      handleWähleDokument(docRef.id);
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
    }
  }, [user, dokumente, handleWähleDokument]);

  const handleFavorit = useCallback(async (id: string) => {
    if (!user) return;
    const dokument = dokumente.find((d) => d.id === id);
    if (!dokument) return;

    const newFavorit = !dokument.isFavorit;
    setDokumente((prev) => prev.map((d) => (d.id === id ? { ...d, isFavorit: newFavorit } : d)));

    try {
      await updateDoc(doc(db, 'users', user.uid, 'dokumente', id), { isFavorit: newFavorit });
    } catch (error) {
      console.error('Fehler beim Favorit:', error);
      // Rollback UI on error
      setDokumente((prev) => prev.map((d) => (d.id === id ? { ...d, isFavorit: !newFavorit } : d)));
    }
  }, [user, dokumente]);

  // ── Vorlage laden ─────────────────────────────────────────────────────────

  const handleVorlageWählen = useCallback((neuerInhalt: OutputData) => {
    if (!aktuelleId) return;

    // 1. UI sofort aktualisieren
    setDokumente((prev) => 
      prev.map((d) => 
        d.id === aktuelleId ? { ...d, inhalt: neuerInhalt } : d
      )
    );

    // 2. Änderung für das Speichern vormerken
    pendingInhaltRef.current = neuerInhalt;

    // 3. Bestehenden Auto-Save-Timer abbrechen
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 4. Sofort speichern
    saveNow();

  }, [aktuelleId, saveNow]);

  // ── Derived State & Memoization ───────────────────────────────────────────

  const aktuellesDoc = useMemo(() => dokumente.find((d) => d.id === aktuelleId), [dokumente, aktuelleId]);

  const saveLabel = useMemo(() => {
    switch (saveStatus) {
      case 'pending':  return { text: '● Nicht gespeichert', color: '#e67e22' };
      case 'saving':   return { text: '⟳ Wird gespeichert…', color: '#3498db' };
      case 'saved':    return { text: '✓ Gespeichert', color: '#27ae60' };
      case 'error':    return { text: '✗ Fehler beim Speichern', color: '#e74c3c' };
      default:         return null;
    }
  }, [saveStatus]);
  
  // ── Render ────────────────────────────────────────────────────────────────

  if (loading || !user) {
    return <div style={styles.centered}><div style={styles.spinner} /><p>Wird geladen…</p></div>;
  }

  if (isLoading) {
    return <div style={styles.centered}><div style={styles.spinner} /><p>Lade deine Gottesdienste…</p></div>;
  }

  return (
    <div style={styles.pageWrapper}>
      <Sidebar
        dokumente={dokumente}
        aktuelleId={aktuelleId}
        onWähleDokument={handleWähleDokument}
        onNeuGottesdienst={erstelleNeuenGottesdienst}
        onNeuNotiz={() => router.push('/notizen')}
        onLöschen={handleLöschen}
        onKopieren={handleKopieren}
        onFavorit={handleFavorit}
        docType="gottesdienst"
      />

      <div style={styles.editorWrapper}>
        {aktuellesDoc ? (
          <>
            <div style={styles.toolbar}>
              <VorlagenMenu onVorlageWählen={handleVorlageWählen} />
              <div style={styles.toolbarRight}>
                {saveLabel && <span style={{ ...styles.saveStatus, color: saveLabel.color }}>{saveLabel.text}</span>}
                <button
                  onClick={() => {
                    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                    saveNow();
                  }}
                  disabled={saveStatus !== 'pending' && saveStatus !== 'error'}
                  style={{
                    ...styles.saveButton,
                    ...(saveStatus !== 'pending' && saveStatus !== 'error' ? styles.saveButtonDisabled : {}),
                  }}
                  title="Speichern (Strg+S)"
                >
                  💾 Speichern
                </button>
              </div>
            </div>

            <div style={styles.editorArea}>
              <input
                type="text"
                value={aktuellesDoc.titel}
                onChange={(e) => handleUpdateTitel(e.target.value)}
                placeholder="Titel eingeben…"
                style={styles.titelInput}
              />
              <Editor
                documentId={aktuelleId!}
                value={aktuellesDoc.inhalt}
                onChange={handleUpdateInhalt}
              />
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⛪</div>
            <h2 style={styles.emptyTitle}>Wähle einen Gottesdienst</h2>
            <p style={styles.emptyText}>
              Wähle einen Gottesdienst aus der Liste oder erstelle einen neuen.
            </p>
            <button onClick={erstelleNeuenGottesdienst} style={styles.newButton}>
              + Neuen Gottesdienst erstellen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    height: '100%',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '16px',
    color: '#7f8c8d',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2c3e50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  editorWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    flexShrink: 0,
    gap: '12px',
    flexWrap: 'wrap',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  saveStatus: {
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  saveButton: {
    padding: '7px 16px',
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'background-color 0.2s ease',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
    cursor: 'default',
  },
  editorArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '30px 40px',
  },
  titelInput: {
    width: '100%',
    fontSize: '2rem',
    fontWeight: 'bold',
    border: 'none',
    outline: 'none',
    marginBottom: '24px',
    color: '#2c3e50',
    fontFamily: 'Georgia, serif',
    backgroundColor: 'transparent',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  emptyText: {
    fontSize: '1rem',
    marginBottom: '24px',
    maxWidth: '400px',
  },
  newButton: {
    padding: '12px 24px',
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
  },
};