'use client';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isLogin) {
      // Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      // Register
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        alert('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails, um Ihr Konto zu bestätigen.');
        setIsLogin(true); // Switch to login view
      }
    }
  };

  if (loading || user) {
    return <div>Lade...</div>; // Or a loading spinner
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isLogin ? 'Anmelden' : 'Registrieren'}</h1>
        <p style={styles.subtitle}>Willkommen bei OrdoServus</p>
        
        <form onSubmit={handleAuth} style={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail"
            style={styles.input}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            {isLogin ? 'Anmelden' : 'Registrieren'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>

        <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
          {isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Jetzt anmelden'}
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f1f3f4'
    },
    card: {
        padding: '40px 50px',
        borderRadius: '12px',
        background: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        width: '400px',
        textAlign: 'center'
    },
    title: {
        fontSize: '2.2rem',
        color: '#2c3e50',
        marginBottom: '10px'
    },
    subtitle: {
        fontSize: '1rem',
        color: '#7f8c8d',
        marginBottom: '30px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    input: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem'
    },
    button: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: 'none',
        background: '#ef5c22',
        color: 'white',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginTop: '10px'
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        color: '#3498db',
        cursor: 'pointer',
        marginTop: '20px',
        fontSize: '0.9rem'
    },
    error: {
        color: 'red',
        marginTop: '10px'
    }
};