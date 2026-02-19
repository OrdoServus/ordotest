'use client';
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

// Deutsche Fehlermeldungen für Firebase Auth
const getGermanErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'Ungültige E-Mail-Adresse.',
    'auth/user-disabled': 'Dieses Konto wurde deaktiviert.',
    'auth/user-not-found': 'Kein Konto mit dieser E-Mail-Adresse gefunden.',
    'auth/wrong-password': 'Falsches Passwort.',
    'auth/invalid-credential': 'Falsche E-Mail oder Passwort.',
    'auth/email-already-in-use': 'Diese E-Mail-Adresse wird bereits verwendet.',
    'auth/weak-password': 'Das Passwort ist zu schwach. Mindestens 6 Zeichen erforderlich.',
    'auth/invalid-password': 'Ungültiges Passwort.',
    'auth/too-many-requests': 'Zu viele Versuche. Bitte versuchen Sie es später erneut.',
    'auth/network-request-failed': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
    'auth/internal-error': 'Ein interner Fehler ist aufgetreten.',
    'auth/popup-closed-by-user': 'Anmeldung abgebrochen.',
    'auth/unauthorized-domain': 'Diese Domain ist nicht autorisiert.',
    'auth/operation-not-allowed': 'Diese Operation ist nicht erlaubt.',
  };
  return errorMessages[errorCode] || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // CSS-Animation für Spinner injizieren (nur Client-seitig)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('login-spinner-style');
      if (!existingStyle) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'login-spinner-style';
        styleSheet.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(styleSheet);
      }
    }
  }, []);


  // E-Mail-Validierung
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validierung
    if (!isValidEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        // Erfolgreich - Weiterleitung erfolgt durch useEffect
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Optional: DisplayName setzen (kann leer bleiben)
        await updateProfile(userCredential.user, {
          displayName: email.split('@')[0]
        });

        setSuccessMessage('Registrierung erfolgreich! Sie werden jetzt angemeldet...');
        
        // Kurze Verzögerung für bessere UX
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage(null);
          // Automatisch einloggen nach Registrierung
          signInWithEmailAndPassword(auth, email, password);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = getGermanErrorMessage(error.code) || error.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Formular zurücksetzen beim Wechsel
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  if (authLoading || user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Wird geladen...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isLogin ? 'Anmelden' : 'Registrieren'}</h1>
        <p style={styles.subtitle}>Willkommen bei OrdoServus</p>
        
        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              style={styles.input}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? 'Ihr Passwort' : 'Mindestens 6 Zeichen'}
              style={styles.input}
              disabled={isLoading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {!isLogin && password.length > 0 && password.length < 6 && (
              <span style={styles.hint}>Mindestens 6 Zeichen erforderlich</span>
            )}
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.buttonContent}>
                <span style={styles.smallSpinner}></span>
                {isLogin ? 'Wird angemeldet...' : 'Wird registriert...'}
              </span>
            ) : (
              isLogin ? 'Anmelden' : 'Registrieren'
            )}
          </button>

          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.error}>{error}</p>
            </div>
          )}

          {successMessage && (
            <div style={styles.successContainer}>
              <span style={styles.successIcon}>✅</span>
              <p style={styles.success}>{successMessage}</p>
            </div>
          )}
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>oder</span>
        </div>

        <button 
          onClick={toggleMode} 
          style={styles.toggleButton}
          disabled={isLoading}
        >
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
        minHeight: '100vh',
        backgroundColor: '#f1f3f4',
        padding: '20px'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f1f3f4',
        gap: '20px'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #ef5c22',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    smallSpinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid #ffffff',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '8px',
    },
    loadingText: {
        color: '#7f8c8d',
        fontSize: '1.1rem',
    },
    card: {
        padding: '40px 50px',
        borderRadius: '12px',
        background: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
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
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '6px',
    },
    label: {
        fontSize: '0.9rem',
        color: '#555',
        fontWeight: 500,
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    },
    hint: {
        fontSize: '0.8rem',
        color: '#e74c3c',
    },
    button: {
        padding: '14px 15px',
        borderRadius: '8px',
        border: 'none',
        background: '#ef5c22',
        color: 'white',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginTop: '10px',
        fontWeight: 500,
        transition: 'background 0.2s, transform 0.1s',
    },
    buttonDisabled: {
        background: '#ccc',
        cursor: 'not-allowed',
    },
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        margin: '25px 0',
        position: 'relative',
        textAlign: 'center',
    },
    dividerText: {
        backgroundColor: 'white',
        padding: '0 15px',
        color: '#95a5a6',
        fontSize: '0.9rem',
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        color: '#3498db',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 500,
        padding: '10px',
        transition: 'color 0.2s',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#fee',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #fcc',
    },
    errorIcon: {
        fontSize: '1.2rem',
    },
    error: {
        color: '#c0392b',
        margin: 0,
        fontSize: '0.95rem',
        textAlign: 'left',
        flex: 1,
    },
    successContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#efe',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #cfc',
    },
    successIcon: {
        fontSize: '1.2rem',
    },
    success: {
        color: '#27ae60',
        margin: 0,
        fontSize: '0.95rem',
        textAlign: 'left',
        flex: 1,
    },
};
