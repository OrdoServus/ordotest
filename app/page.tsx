'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../login/supabaseClient'; // Import supabase instance

import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dokumente, setDokumente] = useState<any[]>([]);
  const [aktuelleId, setAktuelleId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/info');
    }
  }, [user, loading, router]);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from('dokumente')
        .select('*')
        .eq('user_id', user.id)
        .order('datum', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
      } else {
        setDokumente(data);
      }
    }
  }, [user]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (user) {
      fetchData(); // Initial fetch

      const subscription = supabase
        .channel('public:dokumente')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dokumente' }, (payload) => {
          fetchData(); // Refetch on any change
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, fetchData]);

  const aktuellesDoc = dokumente.find(d => d.id === aktuelleId);

  const handleUpdate = useCallback(async (feld: 'titel' | 'inhalt', wert: string) => {
    if (!user || !aktuelleId) return;
    await supabase
      .from('dokumente')
      .update({ [feld]: wert })
      .eq('id', aktuelleId);
  }, [user, aktuelleId]);

  const erstelleNeuenGottesdienst = async () => {
    if (!user) return;
    const neu = {
      user_id: user.id,
      titel: 'Neuer Gottesdienst',
      inhalt: '<h2>Neuer Gottesdienst</h2><p>Fügen Sie hier Ihren Inhalt ein.</p>',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: 'gottesdienst'
    };
    const { data } = await supabase.from('dokumente').insert(neu).select();
    if (data) {
      setAktuelleId(data[0].id);
    }
  };

  const erstelleNeueNotiz = async () => {
    if (!user) return;
    const neu = {
      user_id: user.id,
      titel: 'Neue Notiz',
      inhalt: '<h2>Neue Notiz</h2><p></p>',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: 'notiz'
    };
    const { data } = await supabase.from('dokumente').insert(neu).select();
    if (data) {
      setAktuelleId(data[0].id);
    }
  };

  const handleLöschen = async (id: string) => {
    if (!user) return;
    if (confirm("Möchten Sie dieses Dokument wirklich endgültig löschen?")) {
      await supabase.from('dokumente').delete().eq('id', id);
      if (aktuelleId === id) setAktuelleId(null);
    }
  };

  const handleKopieren = async (id: string) => {
    if (!user) return;
    const { data: original, error } = await supabase.from('dokumente').select('*').eq('id', id).single();
    
    if (original) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...kopieData } = original;
        const kopie = {
            ...kopieData,
            titel: `${original.titel} (Kopie)`,
            datum: new Date().toISOString()
        };
        await supabase.from('dokumente').insert(kopie);
    } else if (error) {
        console.error("Error fetching doc to copy:", error)
    }
  };

  const handleFavorit = async (id: string) => {
    if (!user) return;
    const { data: doc, error } = await supabase.from('dokumente').select('isFavorit').eq('id', id).single();
    
    if(doc) {
        await supabase.from('dokumente').update({ isFavorit: !doc.isFavorit }).eq('id', id);
    } else if (error) {
        console.error("Error fetching doc to fav:", error)
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
        onNeuGottesdienst={erstelleNeuenGottesdienst}
        onNeuNotiz={erstelleNeueNotiz}
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
            onNeu={erstelleNeuenGottesdienst} // For now, the dashboard button creates a service
          />
        )}
      </div>
    </div>
  );
}
