'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../login/supabaseClient';
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
        const { data, error } = await supabase
          .from('dokumente')
          .select('*')
          .eq('user_id', user.id)
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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dokumente', filter: `user_id=eq.${user.id}` }, () => {
          fetchDokumente();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const createNewDocument = async (typ: 'gottesdienst' | 'notiz') => {
    if (!user) return;
    const isGottesdienst = typ === 'gottesdienst';
    const neu = {
      user_id: user.id,
      titel: isGottesdienst ? 'Neuer Gottesdienst' : 'Neue Notiz',
      inhalt: isGottesdienst ? '# Neuer Gottesdienst\n\nFügen Sie hier Ihren Inhalt ein.' : '# Neue Notiz\n\n',
      datum: new Date().toISOString(),
      isFavorit: false,
      typ: typ,
    };

    const { data, error } = await supabase
      .from('dokumente')
      .insert([neu])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating document:', error);
    } else if (data) {
      router.push(isGottesdienst ? `/gottesdienste?doc=${data.id}` : `/notizen?doc=${data.id}`);
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
