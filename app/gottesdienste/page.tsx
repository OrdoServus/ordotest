'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../login/supabaseClient';

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
      const fetchDokumente = async () => {
        const { data, error } = await supabase
          .from('dokumente')
          .select('*')
          .eq('user_id', user.uid)
          .eq('typ', 'gottesdienst')
          .order('datum', { ascending: false });
        
        if (error) {
          console.error('Error fetching documents:', error);
        } else {
          setDokumente(data || []);
        }
      };

      fetchDokumente();

      // Subscribe to changes
      const subscription = supabase
        .channel('dokumente')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dokumente', filter: `user_id=eq.${user.uid}` }, () => {
          fetchDokumente();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setDokumente([]);
    }
  }, [user, aktuelleId, searchParams]);

  const aktuellesDoc = dokumente.find(d => d.id === aktuelleId);

  const handleUpdate = useCallback(async (feld: 'titel' | 'inhalt', wert: string) => {
    if (!user || !aktuelleId) return;
    const { error } = await supabase
      .from('dokumente')
      .update({ [feld]: wert })
      .eq('id', aktuelleId)
      .eq('user_id', user.uid);
    
    if (error) {
      console.error('Error updating document:', error);
    }
  }, [user, aktuelleId]);

  const erstelleNeuenGottesdienst = async () => {
    if (!user) return;
    const neu = {
      user_id: user.uid,
      titel: 'Neuer Gottesdienst',
      inhalt: '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: 'gottesdienst' as const,
    };

    const { data, error } = await supabase
      .from('dokumente')
      .insert([neu])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating document:', error);
    } else if (data) {
      setAktuelleId(data.id);
    }
  };

  const handleLöschen = async (id: string) => {
    if (!user || !confirm("Möchten Sie diesen Gottesdienst wirklich endgültig löschen?")) return;
    const { error } = await supabase
      .from('dokumente')
      .delete()
      .eq('id', id)
      .eq('user_id', user.uid);
    
    if (error) {
      console.error('Error deleting document:', error);
    } else if (aktuelleId === id) {
      setAktuelleId(null);
    }
  };

  const handleKopieren = async (id: string) => {
    if (!user) return;
    const { data: originalData, error: fetchError } = await supabase
      .from('dokumente')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.uid)
      .single();

    if (fetchError || !originalData) {
      console.error('Error fetching document:', fetchError);
      return;
    }

    const kopie = { 
      ...originalData, 
      titel: `${originalData.titel} (Kopie)`, 
      datum: new Date().toISOString(),
      id: undefined // Remove ID so Supabase generates a new one
    };

    const { error: insertError } = await supabase
      .from('dokumente')
      .insert([kopie]);

    if (insertError) {
      console.error('Error copying document:', insertError);
    }
  };

  const handleFavorit = async (id: string) => {
    if (!user) return;
    const dokument = dokumente.find(d => d.id === id);
    if (!dokument) return;

    const { error } = await supabase
      .from('dokumente')
      .update({ isFavorit: !dokument.isFavorit })
      .eq('id', id)
      .eq('user_id', user.uid);

    if (error) {
      console.error('Error updating favorite status:', error);
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
