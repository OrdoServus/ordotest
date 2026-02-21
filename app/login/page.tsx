'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

// Deutsche Fehlermeldungen
const getGermanErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'Ungültige E-Mail-Adresse.',
    'auth/user-disabled': 'Dieses Konto wurde deaktiviert.',
    'auth/user-not-found': 'Kein Konto mit dieser E-Mail-Adresse gefunden.',
    'auth/wrong-password': 'Falsches Passwort.',
    'auth/invalid-credential': 'Falsche E-Mail oder Passwort.',
    'auth/email-already-in-use': 'Diese E-Mail-Adresse wird bereits verwendet.',
    'auth/weak-password': 'Das Passwort ist zu schwach.',
    'auth/email-not-verified': 'Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden. Wir haben Ihnen einen Bestätigungslink gesendet.',
    'validation/password-requirements': 'Das Passwort muss mindestens 8 Zeichen lang sein und Gross- und Kleinbuchstaben, Zahlen sowie Sonderzeichen enthalten.',
    'validation/password-mismatch': 'Die Passwörter stimmen nicht überein.',
    'validation/invalid-phone-number': 'Bitte geben Sie eine gültige Telefonnummer ein.',
    'auth/too-many-requests': 'Zu viele Versuche. Bitte versuchen Sie es später erneut.',
    'auth/network-request-failed': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
    'auth/internal-error': 'Ein interner Fehler ist aufgetreten.',
    'auth/username-already-in-use': 'Dieser Benutzername ist bereits vergeben.',
    'validation/missing-fields': 'Bitte füllen Sie alle erforderlichen Felder aus.',
    'validation/legal-not-accepted': 'Bitte akzeptieren Sie die Nutzungsbedingungen und die Datenschutzerklärung.',
  };
  return errorMessages[errorCode] || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State-Variablen für die Registrierung
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [parish, setParish] = useState('');
  const [country, setCountry] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState('');
  const [role, setRole] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const favoriteCountries = ['Deutschland', 'Österreich', 'Schweiz', 'Liechtenstein'];
  const europeanCountries = [ "Albanien", "Andorra", "Belgien", "Bosnien und Herzegowina", "Bulgarien", "Dänemark", "Estland", "Finnland", "Frankreich", "Griechenland", "Irland", "Island", "Italien", "Kasachstan", "Kosovo", "Kroatien", "Lettland", "Litauen", "Luxemburg", "Malta", "Mazedonien", "Moldawien", "Monaco", "Montenegro", "Niederlande", "Norwegen", "Polen", "Portugal", "Rumänien", "Russland", "San Marino", "Schweden", "Serbien", "Slowakei", "Slowenien", "Spanien", "Tschechien", "Türkei", "Ukraine", "Ungarn", "Vatikanstadt", "Vereinigtes Königreich", "Weissrussland", "Sonstiges" ];
  const sortedEuropeanCountries = [...favoriteCountries, ...europeanCountries.filter(c => !favoriteCountries.includes(c))];
  const howDidYouHearOptions = ['Empfehlung', 'Internet-Suche', 'Soziale Medien', 'Pfarrbrief', 'Wird in Pfarrei verwendet', 'Andere'];
  const roleOptions = ['Priester', 'Diakon', 'Pastoralassistent', 'Ehrenamtliche', 'Andere'];

  useEffect(() => {
    if (!authLoading && user && user.emailVerified) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const resetState = () => {
    [setError, setSuccessMessage, setEmail, setPassword, setConfirmPassword, setFirstName, setLastName, setUsername, setBirthdate, setPhoneNumber, setParish, setCountry, setHowDidYouHear, setRole].forEach(f => f(''));
    setTermsAccepted(false);
    setPrivacyAccepted(false);
  }

  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password: string): boolean => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  const isValidPhoneNumber = (phone: string): boolean => phone.trim() === '' || /^\+?[0-9\s-()]{7,20}$/.test(phone);
  const isOldEnough = (birthdate: string): boolean => new Date().getFullYear() - new Date(birthdate).getFullYear() >= 16;
  const isUsernameUnique = async (username: string): Promise<boolean> => {
    const q = query(collection(db, "users"), where("username", "==", username));
    return (await getDocs(q)).empty;
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!isValidEmail(email)) return setError(getGermanErrorMessage('auth/invalid-email'));

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Anweisungen zum Zurücksetzen des Passworts wurden an Ihre E-Mail gesendet.');
      setIsForgotPassword(false);
      resetState();
    } catch (error: any) {
      setError(getGermanErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!isValidEmail(email)) return setError(getGermanErrorMessage('auth/invalid-email'));

    setIsLoading(true);
    try {
        if (isLogin) {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                await signOut(auth);
                throw { code: 'auth/email-not-verified' };
            }
        } else {
            if (password !== confirmPassword) throw { code: 'validation/password-mismatch' };
            if ([firstName, lastName, username, birthdate, parish, country, howDidYouHear, role].some(f => f === '')) throw { code: 'validation/missing-fields' };
            if (!termsAccepted || !privacyAccepted) throw { code: 'validation/legal-not-accepted' };
            if (!isValidPassword(password)) throw { code: 'validation/password-requirements' };
            if (!isValidPhoneNumber(phoneNumber)) throw { code: 'validation/invalid-phone-number' };
            if (!isOldEnough(birthdate)) throw { code: 'validation-age', message: 'Sie müssen mindestens 16 Jahre alt sein.' };
            if (!(await isUsernameUnique(username))) throw { code: 'auth/username-already-in-use' };

            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(user);
            await updateProfile(user, { displayName: username || `${firstName} ${lastName}` });
            await setDoc(doc(db, 'users', user.uid), { firstName, lastName, username, email, birthdate, phoneNumber, parish, country, howDidYouHear, role, createdAt: new Date() });
            await signOut(auth);
            
            setSuccessMessage('Fast geschafft! Bitte bestätigen Sie Ihr Konto über den Link, den wir Ihnen per E-Mail gesendet haben.');
            setIsLogin(true);
            resetState();
        }
    } catch (error: any) {
      setError(error.code === 'validation-age' ? error.message : getGermanErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (mode: 'login' | 'register') => {
    setIsLogin(mode === 'login');
    setIsForgotPassword(false);
    resetState();
  };

  if (authLoading || (user && user.emailVerified)) {
    return <div style={styles.loadingContainer}><div style={styles.spinner}></div><p style={styles.loadingText}>Wird geladen...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isForgotPassword ? 'Passwort zurücksetzen' : (isLogin ? 'Anmelden' : 'Registrieren')}</h1>
        <p style={styles.subtitle}>Willkommen bei OrdoServus</p>

        {successMessage && <div style={styles.successContainer}><span style={styles.successIcon}>✅</span><p style={styles.success}>{successMessage}</p></div>}
        {error && <div style={styles.errorContainer}><span style={styles.errorIcon}>⚠️</span><p style={styles.error}>{error}</p></div>}

        {isForgotPassword ? (
            <form onSubmit={(e) => {e.preventDefault(); handleForgotPassword();}} style={styles.form}>
                <div style={styles.inputGroup}><label style={styles.label}>E-Mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ihre registrierte E-Mail" style={styles.input} disabled={isLoading} /></div>
                <button type="submit" style={{...styles.button, ...(isLoading ? styles.buttonDisabled : {})}} disabled={isLoading}>{isLoading ? 'Wird gesendet...' : 'Link zum Zurücksetzen anfordern'}</button>
            </form>
        ) : (
            <form onSubmit={handleAuth} style={styles.form}>
                {!isLogin && (
                    <>
                        <div style={styles.inputGroup}><label style={styles.label}>Vorname</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.input} disabled={isLoading} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Nachname</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.input} disabled={isLoading} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Benutzername</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} disabled={isLoading} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Geburtsdatum</label><input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} style={styles.input} disabled={isLoading} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Telefonnummer (optional)</label><input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.input} disabled={isLoading} /></div>
                    </>
                )}
                <div style={styles.inputGroup}><label style={styles.label}>E-Mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre@email.de" style={styles.input} disabled={isLoading} autoComplete="email"/></div>
                {isLogin && <div style={styles.inputGroup}><label style={styles.label}>Passwort</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Ihr Passwort' style={styles.input} disabled={isLoading} autoComplete='current-password'/></div>}
                {!isLogin && (
                    <>
                        <div style={styles.inputGroup}><label style={styles.label}>Passwort</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Mind. 8 Z., Gross/Klein, Zahl, Symbol' style={styles.input} disabled={isLoading} autoComplete='new-password'/></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Passwort bestätigen</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" style={styles.input} disabled={isLoading} autoComplete="new-password"/></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Pfarrei</label><input type="text" value={parish} onChange={(e) => setParish(e.target.value)} style={styles.input} disabled={isLoading} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Land</label><select value={country} onChange={(e) => setCountry(e.target.value)} style={styles.input} disabled={isLoading}><option value="">Bitte auswählen</option>{sortedEuropeanCountries.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Wie sind Sie auf uns aufmerksam geworden?</label><select value={howDidYouHear} onChange={(e) => setHowDidYouHear(e.target.value)} style={styles.input} disabled={isLoading}><option value="">Bitte auswählen</option>{howDidYouHearOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Position/Rolle</label><select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input} disabled={isLoading}><option value="">Bitte auswählen</option>{roleOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                        <div style={styles.checkboxGroup}><input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} disabled={isLoading} /><label htmlFor="terms" style={styles.checkboxLabel}>Ich akzeptiere die <a href="/terms" target="_blank">Nutzungsbedingungen</a>.</label></div>
                        <div style={styles.checkboxGroup}><input type="checkbox" id="privacy" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} disabled={isLoading} /><label htmlFor="privacy" style={styles.checkboxLabel}>Ich habe die <a href="/privacy" target="_blank">Datenschutzerklärung</a> gelesen.</label></div>
                    </>
                )}
                <button type="submit" style={{...styles.button, ...(isLoading || (!isLogin && !isLogin && (!termsAccepted || !privacyAccepted)) ? styles.buttonDisabled : {})}} disabled={isLoading || (!isLogin && (!termsAccepted || !privacyAccepted))}>{isLoading ? <span style={styles.buttonContent}><span style={styles.smallSpinner}></span>{isLogin ? 'Wird angemeldet...' : 'Wird registriert...'}</span> : (isLogin ? 'Anmelden' : 'Registrieren')}</button>
            </form>
        )}

        {isLogin && !isForgotPassword && <button onClick={() => setIsForgotPassword(true)} style={styles.forgotPasswordButton}>Passwort vergessen?</button>}

        <div style={styles.divider}><span style={styles.dividerText}>oder</span></div>
        
        {isForgotPassword ? (
            <button onClick={() => {setIsForgotPassword(false); resetState();}} style={styles.toggleButton} disabled={isLoading}>Zurück zum Login</button>
        ) : (
            <button onClick={() => toggleMode(isLogin ? 'register' : 'login')} style={styles.toggleButton} disabled={isLoading}>{isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Jetzt anmelden'}</button>
        )}

      </div>
    </div>
  );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f3f4', padding: '20px' },
    loadingContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f3f4', gap: '20px' },
    spinner: { width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #ef5c22', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    smallSpinner: { display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' },
    loadingText: { color: '#7f8c8d', fontSize: '1.1rem' },
    card: { padding: '40px 50px', borderRadius: '12px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px', textAlign: 'center', margin: 'auto 0' },
    title: { fontSize: '2.2rem', color: '#2c3e50', marginBottom: '10px' },
    subtitle: { fontSize: '1rem', color: '#7f8c8d', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', width: '100%' },
    label: { fontSize: '0.9rem', color: '#555', fontWeight: 500 },
    input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' },
    button: { padding: '14px 15px', borderRadius: '8px', border: 'none', background: '#ef5c22', color: 'white', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px', fontWeight: 500 },
    buttonDisabled: { background: '#ccc', cursor: 'not-allowed' },
    buttonContent: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    divider: { margin: '25px 0', position: 'relative', textAlign: 'center' },
    dividerText: { backgroundColor: 'white', padding: '0 15px', color: '#95a5a6', fontSize: '0.9rem' },
    toggleButton: { background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, padding: '10px' },
    forgotPasswordButton: { background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '0.9rem', marginTop: '15px' },
    errorContainer: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fee', padding: '12px', borderRadius: '8px', border: '1px solid #fcc', marginTop: '20px' },
    errorIcon: { fontSize: '1.2rem' },
    error: { color: '#c0392b', margin: 0, fontSize: '0.95rem', textAlign: 'left', flex: 1 },
    successContainer: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#efe', padding: '12px', borderRadius: '8px', border: '1px solid #cfc', marginTop: '20px', marginBottom: '10px' },
    successIcon: { fontSize: '1.2rem' },
    success: { color: '#27ae60', margin: 0, fontSize: '0.95rem', textAlign: 'left', flex: 1 },
    checkboxGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    checkboxLabel: { fontSize: '0.9rem', color: '#555' },
};