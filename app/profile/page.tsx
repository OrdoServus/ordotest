'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../login/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [funktion, setFunktion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch existing profile data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles') // Korrigiert: Lese von 'profiles'
          .select('name, funktion')
          .eq('id', user.id)
          .single();

        if (error) {
          // Kein Fehler loggen, wenn das Profil einfach noch nicht existiert
          if (error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
          }
        } else if (data) {
          setName(data.name || '');
          setFunktion(data.funktion || '');
        }
      };

      fetchProfile();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles') // Korrigiert: Schreibe in 'profiles'
        .upsert({ id: user.id, name, funktion }, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      setMessage('Profil erfolgreich gespeichert!');
      // Redirect to home after a short delay
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      console.error("Error saving profile: ", error);
      setMessage('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
    }

    setIsSaving(false);
  };
  
  if(loading || !user){
      return <div>Lade Profil...</div>
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Ihr Profil</h1>
        <p style={subtitleStyle}>Diese Informationen werden für zukünftige Exporte verwendet.</p>

        <form onSubmit={handleSave}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              placeholder="z.B. Max Mustermann"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Funktion</label>
            <input
              type="text"
              placeholder="z.B. Pfarrer, Diakon, Lektorin"
              value={funktion}
              onChange={(e) => setFunktion(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={isSaving} style={btnStyle}>
            {isSaving ? 'Wird gespeichert...' : 'Speichern & Weiter'}
          </button>
        </form>

        {message && <p style={messageStyle}>{message}</p>}
      </div>
    </div>
  );
}

// Basic Styles (similar to LoginPage for consistency)
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f4f7f6',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '15px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  padding: '40px',
  width: '100%',
  maxWidth: '500px'
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  color: '#2c3e50',
  textAlign: 'center',
  margin: '0 0 10px 0'
};

const subtitleStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#7f8c8d',
  fontSize: '1rem',
  margin: '0 0 30px 0'
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: '20px'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#2c3e50',
  fontWeight: '500'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  boxSizing: 'border-box'
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#2c3e50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  cursor: 'pointer',
  marginTop: '10px'
};

const messageStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '20px',
  color: '#27ae60'
};
