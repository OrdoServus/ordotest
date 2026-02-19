'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [funktion, setFunktion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch existing profile data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setName(data.name || '');
            setFunktion(data.funktion || '');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setMessage({ type: 'error', text: 'Fehler beim Laden des Profils.' });
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
      await setDoc(profileRef, {
        name: name.trim(),
        funktion: funktion.trim(),
        email: user.email,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }, { merge: true });

      setMessage({ type: 'success', text: 'Profil erfolgreich gespeichert!' });
      
      // Redirect to home after a short delay
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern. Bitte versuchen Sie es erneut.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  if (authLoading || !user) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={loadingContainerStyle}>
            <div style={spinnerStyle}></div>
            <p>Lade...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={loadingContainerStyle}>
            <div style={spinnerStyle}></div>
            <p>Profil wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Ihr Profil</h1>
        <p style={subtitleStyle}>Diese Informationen werden für zukünftige Exporte verwendet.</p>

        <form onSubmit={handleSave}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              placeholder="z.B. Max Mustermann"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
              disabled={isSaving}
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
              disabled={isSaving}
            />
          </div>

          <div style={buttonGroupStyle}>
            <button 
              type="button" 
              onClick={handleSkip} 
              disabled={isSaving}
              style={skipButtonStyle}
            >
              Überspringen
            </button>
            
            <button 
              type="submit" 
              disabled={isSaving || !name.trim()}
              style={{
                ...saveButtonStyle,
                opacity: isSaving || !name.trim() ? 0.6 : 1,
                cursor: isSaving || !name.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Wird gespeichert...' : 'Speichern & Weiter'}
            </button>
          </div>
        </form>

        {message && (
          <div style={{
            ...messageStyle,
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}>
            {message.type === 'success' ? '✅ ' : '⚠️ '}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
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

const loadingContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '15px',
  padding: '40px',
};

const spinnerStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #ef5c22',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
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
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '20px',
};

const skipButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '15px',
  backgroundColor: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const saveButtonStyle: React.CSSProperties = {
  flex: 2,
  padding: '15px',
  backgroundColor: '#2c3e50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 500,
  transition: 'background 0.2s',
};

const messageStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '12px',
  borderRadius: '8px',
  textAlign: 'center',
  fontSize: '0.95rem',
};
