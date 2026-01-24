'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from './firebaseClient';
import { sendSignInLinkToEmail } from "firebase/auth";
import Link from 'next/link';

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const actionCodeSettings = {
      url: `${window.location.origin}/`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('E-Mail versendet! Prüfen Sie Ihr Postfach (und den Spam-Ordner) für den Anmelde-Link.');
    } catch (err: any) {
      setError('Anmeldung fehlgeschlagen. Bitte prüfen Sie die E-Mail-Adresse und versuchen Sie es erneut.');
      console.error(err);
    }
    setLoading(false);
  };

  if (authLoading || (!authLoading && user)) {
    return <div style={containerStyle}>Lade...</div>;
  }

  return (
    <div style={containerStyle}>
        <div style={cardStyle}>
            <div style={headerStyle}>
                <div style={logoStyle}>⛪</div>
                <h1 style={titleStyle}>Anmelden bei OrdoServus</h1>
                <p style={subtitleStyle}>Geben Sie Ihre E-Mail ein, um einen sicheren Anmelde-Link zu erhalten.</p>
            </div>

            {message && <p style={messageSuccessStyle}>{message}</p>}
            {error && <p style={messageErrorStyle}>{error}</p>}

            <form onSubmit={handleLogin}>
                <div style={inputGroupStyle}>
                    <label htmlFor="email" style={labelStyle}>E-Mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="name@pfarrei.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <button type="submit" disabled={loading} style={btnStyle(loading)}>
                    {loading ? 'Wird gesendet...' : 'Anmelde-Link anfordern'}
                </button>
            </form>

            <div style={footerStyle}>
                <p>Neu hier? <Link href="/info" style={linkStyle}>Erfahren Sie mehr über OrdoServus.</Link></p>
            </div>
        </div>
    </div>
  );
}

// Modernes und sauberes Styling
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f4f7f6', // Heller, neutraler Hintergrund
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
  padding: '48px',
  width: '100%',
  maxWidth: '480px'
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px'
};

const logoStyle: React.CSSProperties = {
  fontSize: '3rem',
  lineHeight: 1,
  marginBottom: '16px'
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  color: '#2c3e50',
  fontWeight: '600',
  margin: '0 0 8px 0'
};

const subtitleStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '1rem',
  margin: 0
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: '24px'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#2c3e50',
  fontWeight: '500',
  fontSize: '0.9rem'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #dce1e6',
  fontSize: '1rem',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

const btnStyle = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '16px',
  backgroundColor: '#2c3e50',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.2s, transform 0.2s',
  opacity: loading ? 0.7 : 1
});

const messageBaseStyle: React.CSSProperties = {
  padding: '12px',
  margin: '0 0 20px 0',
  borderRadius: '8px',
  textAlign: 'center',
  fontSize: '0.95rem'
};

const messageSuccessStyle: React.CSSProperties = {
  ...messageBaseStyle,
  backgroundColor: '#e8f5e9', // Grünlich
  color: '#2e7d32'
};

const messageErrorStyle: React.CSSProperties = {
  ...messageBaseStyle,
  backgroundColor: '#ffebee', // Rötlich
  color: '#c62828'
};

const footerStyle: React.CSSProperties = {
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e9ecef',
  textAlign: 'center',
  fontSize: '0.9rem',
  color: '#7f8c8d'
};

const linkStyle: React.CSSProperties = {
  color: '#3498db',
  textDecoration: 'none',
  fontWeight: '500'
};