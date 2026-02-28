'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, sendEmailVerification, signOut, sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import Link from 'next/link';

// ── German error messages ─────────────────────────────────────────────────────
const ERRORS: Record<string, string> = {
  'auth/invalid-email':         'Ungültige E-Mail-Adresse.',
  'auth/user-disabled':         'Dieses Konto wurde deaktiviert.',
  'auth/user-not-found':        'Kein Konto mit dieser E-Mail gefunden.',
  'auth/wrong-password':        'Falsches Passwort.',
  'auth/invalid-credential':    'Falsche E-Mail oder Passwort.',
  'auth/email-already-in-use':  'Diese E-Mail wird bereits verwendet.',
  'auth/weak-password':         'Das Passwort ist zu schwach.',
  'auth/too-many-requests':     'Zu viele Versuche. Bitte später erneut versuchen.',
  'auth/network-request-failed':'Netzwerkfehler. Bitte Verbindung prüfen.',
  'auth/email-not-verified':    'Bitte bestätige zuerst deine E-Mail. Wir haben dir einen Link geschickt.',
  'validation/password-mismatch': 'Die Passwörter stimmen nicht überein.',
  'validation/password-requirements': 'Passwort: mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl und Sonderzeichen.',
  'validation/invalid-phone':   'Bitte eine gültige Telefonnummer eingeben.',
  'validation/missing-fields':  'Bitte alle Pflichtfelder ausfüllen.',
  'validation/legal-not-accepted': 'Bitte AGB und Datenschutz akzeptieren.',
  'validation/too-young':       'Du musst mindestens 16 Jahre alt sein.',
  'auth/username-taken':        'Dieser Benutzername ist bereits vergeben.',
};
const ge = (code: string) => ERRORS[code] ?? 'Ein unerwarteter Fehler ist aufgetreten.';

const isValidEmail    = (e: string)  => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPassword = (p: string)  => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(p);
const isValidPhone    = (p: string)  => p.trim() === '' || /^\+?[0-9\s\-()\u002B]{7,20}$/.test(p);
const isOldEnough     = (dob: string)=> new Date().getFullYear() - new Date(dob).getFullYear() >= 16;

const COUNTRIES = [
  'Deutschland', 'Österreich', 'Schweiz', 'Liechtenstein',
  'Albanien','Andorra','Belgien','Bosnien und Herzegowina','Bulgarien',
  'Dänemark','Estland','Finnland','Frankreich','Griechenland','Irland','Island',
  'Italien','Kosovo','Kroatien','Lettland','Litauen','Luxemburg','Malta',
  'Montenegro','Niederlande','Norwegen','Polen','Portugal','Rumänien',
  'Schweden','Serbien','Slowakei','Slowenien','Spanien','Tschechien',
  'Türkei','Ukraine','Ungarn','Vatikanstadt','Vereinigtes Königreich','Sonstiges',
];
const HOW = ['Empfehlung', 'Internet-Suche', 'Soziale Medien', 'Pfarrbrief', 'Wird in Pfarrei verwendet', 'Andere'];
const ROLES = ['Priester', 'Diakon', 'Pastoralassistent', 'Ehrenamtliche', 'Andere'];

export default function LoginPage() {
  const [isLogin,        setIsLogin]        = useState(true);
  const [isForgot,       setIsForgot]       = useState(false);
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [confirmPw,      setConfirmPw]      = useState('');
  const [firstName,      setFirstName]      = useState('');
  const [lastName,       setLastName]       = useState('');
  const [username,       setUsername]       = useState('');
  const [birthdate,      setBirthdate]      = useState('');
  const [phone,          setPhone]          = useState('');
  const [parish,         setParish]         = useState('');
  const [country,        setCountry]        = useState('');
  const [howHeard,       setHowHeard]       = useState('');
  const [role,           setRole]           = useState('');
  const [termsOk,        setTermsOk]        = useState(false);
  const [privacyOk,      setPrivacyOk]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState<string | null>(null);
  const [isLoading,      setIsLoading]      = useState(false);
  const [showPw,         setShowPw]         = useState(false);

  const router  = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user?.emailVerified) router.push('/dashboard');
  }, [user, authLoading, router]);

  const reset = () => {
    setError(null); setSuccess(null);
    setEmail(''); setPassword(''); setConfirmPw('');
    setFirstName(''); setLastName(''); setUsername(''); setBirthdate('');
    setPhone(''); setParish(''); setCountry(''); setHowHeard(''); setRole('');
    setTermsOk(false); setPrivacyOk(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError(ge('auth/invalid-email'));
    setIsLoading(true); setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Wir haben dir eine E-Mail zum Zurücksetzen des Passworts gesendet.');
      setIsForgot(false);
    } catch (err: any) { setError(ge(err.code)); }
    finally { setIsLoading(false); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!isValidEmail(email)) return setError(ge('auth/invalid-email'));
    setIsLoading(true);

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) { await signOut(auth); throw { code: 'auth/email-not-verified' }; }
        router.push('/dashboard');
      } else {
        // Validation
        if (![firstName, lastName, username, birthdate, parish, country, howHeard, role].every(Boolean))
          throw { code: 'validation/missing-fields' };
        if (!termsOk || !privacyOk) throw { code: 'validation/legal-not-accepted' };
        if (password !== confirmPw)  throw { code: 'validation/password-mismatch' };
        if (!isValidPassword(password)) throw { code: 'validation/password-requirements' };
        if (!isValidPhone(phone))    throw { code: 'validation/invalid-phone' };
        if (!isOldEnough(birthdate)) throw { code: 'validation/too-young' };

        // Check username uniqueness
        const snap = await getDocs(query(collection(db, 'users'), where('username', '==', username)));
        if (!snap.empty) throw { code: 'auth/username-taken' };

        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(newUser, { displayName: username });
        await sendEmailVerification(newUser);
        await setDoc(doc(db, 'users', newUser.uid), {
          firstName, lastName, username, email, birthdate,
          phoneNumber: phone, parish, country, howDidYouHear: howHeard, role,
          createdAt: new Date(),
        });
        await signOut(auth);
        setSuccess('Fast geschafft! Bitte bestätige dein Konto über den Link in deiner E-Mail.');
        setIsLogin(true);
        reset();
      }
    } catch (err: any) {
      setError(ge(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (user?.emailVerified)) {
    return (
      <div style={st.centered}>
        <div style={st.spinner} />
        <p style={{ color: '#7f8c8d' }}>Wird weitergeleitet…</p>
      </div>
    );
  }

  const inputProps = (value: string, setter: (v: string) => void, extra?: Partial<React.InputHTMLAttributes<HTMLInputElement>>) => ({
    value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setter(e.target.value); setError(null); },
    disabled: isLoading, style: st.input, ...extra,
  });

  return (
    <div style={st.page}>
      <div style={st.card}>
        {/* Logo */}
        <div style={st.logo}>⛪ OrdoServus</div>
        <h1 style={st.title}>
          {isForgot ? 'Passwort zurücksetzen' : isLogin ? 'Anmelden' : 'Registrieren'}
        </h1>

        {success && <div style={st.successBox}><span>✅</span>{success}</div>}
        {error   && <div style={st.errorBox}><span>⚠️</span>{error}</div>}

        {/* Forgot Password */}
        {isForgot && (
          <form onSubmit={handleForgot} style={st.form}>
            <label style={st.label}>E-Mail</label>
            <input type="email" {...inputProps(email, setEmail, { placeholder: 'deine@email.de', autoFocus: true })} />
            <button type="submit" style={st.btnPrimary} disabled={isLoading}>
              {isLoading ? 'Wird gesendet…' : 'Link anfordern'}
            </button>
            <button type="button" onClick={() => { setIsForgot(false); reset(); }} style={st.btnGhost}>
              ← Zurück zum Login
            </button>
          </form>
        )}

        {/* Login / Register */}
        {!isForgot && (
          <form onSubmit={handleAuth} style={st.form}>
            {!isLogin && (
              <>
                <div style={st.row}>
                  <div style={st.col}><label style={st.label}>Vorname *</label><input {...inputProps(firstName, setFirstName)} /></div>
                  <div style={st.col}><label style={st.label}>Nachname *</label><input {...inputProps(lastName, setLastName)} /></div>
                </div>
                <label style={st.label}>Benutzername *</label>
                <input {...inputProps(username, setUsername, { autoComplete: 'username' })} />
                <label style={st.label}>Geburtsdatum *</label>
                <input type="date" {...inputProps(birthdate, setBirthdate)} />
                <label style={st.label}>Telefonnummer (optional)</label>
                <input type="tel" {...inputProps(phone, setPhone, { placeholder: '+41 79 …' })} />
              </>
            )}

            <label style={st.label}>E-Mail *</label>
            <input type="email" {...inputProps(email, setEmail, { placeholder: 'deine@email.de', autoComplete: 'email' })} />

            <label style={st.label}>Passwort *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                {...inputProps(password, setPassword, { autoComplete: isLogin ? 'current-password' : 'new-password', placeholder: isLogin ? 'Dein Passwort' : 'Mind. 8 Z., Groß/Klein, Zahl, Symbol' })}
                style={{ ...st.input, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={st.eyeBtn}
                tabIndex={-1}
                aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {!isLogin && (
              <>
                <label style={st.label}>Passwort bestätigen *</label>
                <input type="password" {...inputProps(confirmPw, setConfirmPw, { autoComplete: 'new-password', placeholder: 'Passwort wiederholen' })} />

                <label style={st.label}>Pfarrei *</label>
                <input {...inputProps(parish, setParish)} />

                <label style={st.label}>Land *</label>
                <select value={country} onChange={e => setCountry(e.target.value)} style={st.input} disabled={isLoading}>
                  <option value="">Bitte auswählen</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <label style={st.label}>Wie bist du auf uns aufmerksam geworden? *</label>
                <select value={howHeard} onChange={e => setHowHeard(e.target.value)} style={st.input} disabled={isLoading}>
                  <option value="">Bitte auswählen</option>
                  {HOW.map(h => <option key={h} value={h}>{h}</option>)}
                </select>

                <label style={st.label}>Position / Rolle *</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={st.input} disabled={isLoading}>
                  <option value="">Bitte auswählen</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <div style={st.checkRow}>
                  <input type="checkbox" id="terms" checked={termsOk} onChange={e => setTermsOk(e.target.checked)} />
                  <label htmlFor="terms" style={st.checkLabel}>
                    Ich akzeptiere die <Link href="/info/legal/impressum" target="_blank" style={st.checkLink}>Nutzungsbedingungen</Link>.
                  </label>
                </div>
                <div style={st.checkRow}>
                  <input type="checkbox" id="privacy" checked={privacyOk} onChange={e => setPrivacyOk(e.target.checked)} />
                  <label htmlFor="privacy" style={st.checkLabel}>
                    Ich habe die <Link href="/info/legal/datenschutz" target="_blank" style={st.checkLink}>Datenschutzerklärung</Link> gelesen.
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              style={{ ...st.btnPrimary, ...( (isLoading || (!isLogin && (!termsOk || !privacyOk))) ? st.btnDisabled : {}) }}
              disabled={isLoading || (!isLogin && (!termsOk || !privacyOk))}
            >
              {isLoading
                ? (isLogin ? 'Wird angemeldet…' : 'Wird registriert…')
                : (isLogin ? 'Anmelden' : 'Registrieren')}
            </button>

            {isLogin && (
              <button type="button" onClick={() => { setIsForgot(true); setError(null); }} style={st.btnGhost}>
                Passwort vergessen?
              </button>
            )}

            <div style={st.divider}><span style={st.dividerText}>oder</span></div>

            <button
              type="button"
              onClick={() => { setIsLogin(p => !p); reset(); }}
              style={st.btnSwitch}
              disabled={isLoading}
            >
              {isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Jetzt anmelden'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const st: { [key: string]: React.CSSProperties } = {
  page:       { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', backgroundColor: '#f1f3f4', padding: '40px 20px' },
  centered:   { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' },
  spinner:    { width: '44px', height: '44px', border: '4px solid #f3f3f3', borderTop: '4px solid #2c3e50', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  card:       { width: '100%', maxWidth: '460px', backgroundColor: 'white', borderRadius: '14px', padding: '40px', boxShadow: '0 10px 32px rgba(0,0,0,0.1)' },
  logo:       { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50', marginBottom: '8px' },
  title:      { textAlign: 'center', fontSize: '1.5rem', color: '#2c3e50', margin: '0 0 24px', fontWeight: 600 },
  form:       { display: 'flex', flexDirection: 'column', gap: '10px' },
  label:      { fontSize: '0.83rem', fontWeight: 600, color: '#555', marginBottom: '2px' },
  input:      { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  row:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  col:        { display: 'flex', flexDirection: 'column', gap: '4px' },
  eyeBtn:     { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' },
  checkRow:   { display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' },
  checkLabel: { fontSize: '0.85rem', color: '#555', lineHeight: 1.4 },
  checkLink:  { color: '#007bff', textDecoration: 'none' },
  btnPrimary: { padding: '13px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 600, marginTop: '6px' },
  btnDisabled:{ backgroundColor: '#bdc3c7', cursor: 'not-allowed' },
  btnGhost:   { padding: '8px', background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '0.88rem', textAlign: 'center' },
  btnSwitch:  { padding: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
  divider:    { position: 'relative', textAlign: 'center', margin: '6px 0' },
  dividerText:{ backgroundColor: 'white', padding: '0 12px', color: '#95a5a6', fontSize: '0.85rem', position: 'relative', zIndex: 1 },
  successBox: { display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: '#eafaf1', padding: '12px', borderRadius: '8px', border: '1px solid #a9dfbf', color: '#1e8449', fontSize: '0.9rem', marginBottom: '8px' },
  errorBox:   { display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: '#fdf2f2', padding: '12px', borderRadius: '8px', border: '1px solid #f5c6cb', color: '#c0392b', fontSize: '0.9rem', marginBottom: '8px' },
};
