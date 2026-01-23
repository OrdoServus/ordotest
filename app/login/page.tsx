"use client";
import { useState } from 'react';
import { supabase } from './supabaseClient';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) alert(error.message);
    else alert('Checken Sie Ihr E-Mail-Postfach für den Login-Link!');
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div style={logoStyle}>⛪</div>
            <h1 style={titleStyle}>Willkommen bei OrdoServus</h1>
            <p style={subtitleStyle}>Melden Sie sich an, um Ihre liturgischen Dokumente zu verwalten</p>
          </div>

          <form onSubmit={handleLogin} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>E-Mail-Adresse</label>
              <input
                type="email"
                placeholder="ihre.email@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? (
                <span style={loadingStyle}>
                  <div className="spinner" style={spinnerStyle}></div>
                  Sende Magic Link...
                </span>
              ) : (
                'Magic Link senden'
              )}
            </button>
          </form>

          <div style={footerStyle}>
            <p style={footerTextStyle}>
              Kein Account? <Link href="/info" style={linkStyle}>Mehr erfahren</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Styles
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '20px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  padding: '40px',
  width: '100%',
  maxWidth: '450px',
  textAlign: 'center'
};

const headerStyle: React.CSSProperties = {
  marginBottom: '30px'
};

const logoStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '15px'
};

const titleStyle: React.CSSProperties = {
  fontSize: '2.2rem',
  color: '#2c3e50',
  margin: '0 0 10px 0',
  fontWeight: '600'
};

const subtitleStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '1.1rem',
  margin: '0',
  lineHeight: '1.5'
};

const formStyle: React.CSSProperties = {
  marginBottom: '30px'
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: '25px',
  textAlign: 'left'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#2c3e50',
  fontWeight: '500',
  fontSize: '0.95rem'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  borderRadius: '10px',
  border: '2px solid #e1e8ed',
  fontSize: '1rem',
  transition: 'border-color 0.3s ease',
  boxSizing: 'border-box'
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#2c3e50',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1.1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const spinnerStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  border: '2px solid #ffffff',
  borderTop: '2px solid transparent',
  borderRadius: '50%'
};

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid #e1e8ed',
  paddingTop: '20px'
};

const footerTextStyle: React.CSSProperties = {
  color: '#7f8c8d',
  fontSize: '0.95rem',
  margin: '0'
};

const linkStyle: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
  fontWeight: '500'
};