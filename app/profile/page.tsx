'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const roleOptions = ['Priester', 'Diakon', 'Pastoralassistent', 'Ehrenamtliche', 'Andere'];
const countryOptions = ['Deutschland', 'Österreich', 'Schweiz', 'Liechtenstein', "Albanien", "Andorra", "Belgien", "Bosnien und Herzegowina", "Bulgarien", "Dänemark", "Estland", "Finnland", "Frankreich", "Griechenland", "Irland", "Island", "Italien", "Kasachstan", "Kosovo", "Kroatien", "Lettland", "Litauen", "Luxemburg", "Malta", "Mazedonien", "Moldawien", "Monaco", "Montenegro", "Niederlande", "Norwegen", "Polen", "Portugal", "Rumänien", "Russland", "San Marino", "Schweden", "Serbien", "Slowakei", "Slowenien", "Spanien", "Tschechien", "Türkei", "Ukraine", "Ungarn", "Vatikanstadt", "Vereinigtes Königreich", "Weissrussland", "Sonstiges"];


export default function ProfilePage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<any>({});

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (userProfile) setFormData({ ...userProfile });
  }, [user, loading, userProfile, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setIsUpdating(true);

    try {
        if (formData.username && formData.username !== userProfile?.username) {
            const q = query(collection(db, "users"), where("username", "==", formData.username));
            if (!(await getDocs(q)).empty) throw new Error('Dieser Benutzername ist bereits vergeben.');
        }

        await updateDoc(doc(db, 'users', user.uid), formData);
        if(refreshUserProfile) await refreshUserProfile();

        setSuccess('Ihr Profil wurde erfolgreich aktualisiert.');
        setIsEditMode(false);
    } catch (error: any) {
      setError(error.message || 'Fehler beim Aktualisieren des Profils.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Die neuen Passwörter stimmen nicht überein.');
    if (!user?.email) return;

    setError(null); setSuccess(null); setIsUpdating(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess('Ihr Passwort wurde erfolgreich aktualisiert.');
      setIsModalOpen(false);
    } catch (error) {
      setError('Fehler bei der Passwortaktualisierung. Überprüfen Sie Ihr altes Passwort.');
    } finally {
      setIsUpdating(false);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    }
  };

  if (loading || !user || !userProfile) {
    return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;
  }

  const renderProfileField = (label: string, name: string, type = 'text', options?: string[]) => (
    <div style={styles.profileItem}>
        <span style={styles.label}>{label}:</span>
        {isEditMode ? (
            type === 'select' ? (
                <select name={name} value={formData[name] || ''} onChange={handleInputChange} style={styles.input}>{options?.map(o => <option key={o} value={o}>{o}</option>)}</select>
            ) : (
                <input name={name} type={type} value={formData[name] || ''} onChange={handleInputChange} style={styles.input} />
            )
        ) : (
            <span>{name === 'birthdate' && userProfile[name] ? new Date(userProfile[name]).toLocaleDateString('de-DE') : userProfile[name] || '–'}</span>
        )}
    </div>
  );

  return (
    <div style={styles.container}>
        <form onSubmit={handleProfileUpdate} style={styles.card}>
            <h1 style={styles.title}>Mein Profil</h1>
            {success && <p style={styles.successMessage}>{success}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}

            <div style={styles.profileList}>
                {renderProfileField('Vorname', 'firstName')}
                {renderProfileField('Nachname', 'lastName')}
                {renderProfileField('Benutzername', 'username')}
                <div style={styles.profileItem}><span style={styles.label}>E-Mail:</span> <span>{user?.email || '–'}</span></div>
                {renderProfileField('Geburtsdatum', 'birthdate', 'date')}
                {renderProfileField('Telefonnummer', 'phoneNumber', 'tel')}
                {renderProfileField('Pfarrei', 'parish')}
                {renderProfileField('Land', 'country', 'select', countryOptions)}
                {renderProfileField('Rolle', 'role', 'select', roleOptions)}
            </div>
            
            <div style={styles.actions}>
                {isEditMode ? (
                    <>
                        <button type="button" onClick={() => { setIsEditMode(false); setFormData({...userProfile}); }} style={{...styles.button, ...styles.buttonSecondary}}>Abbrechen</button>
                        <button type="submit" disabled={isUpdating} style={styles.button}>{isUpdating ? 'Wird gespeichert...' : 'Speichern'}</button>
                    </>
                ) : (
                    <button type="button" onClick={() => setIsEditMode(true)} style={styles.button}>Profil bearbeiten</button>
                )}
            </div>

            <button type="button" onClick={() => setIsModalOpen(true)} style={{...styles.button, marginTop: '10px'}}>Passwort ändern</button>
            <button type="button" onClick={() => router.push('/')} style={{...styles.button, ...styles.buttonSecondary, marginTop: '10px'}}>Zurück zum Dashboard</button>
      </form>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Passwort ändern</h2>
            <form onSubmit={handlePasswordChange}>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Altes Passwort" required style={styles.inputModal}/>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Neues Passwort" required style={styles.inputModal}/>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Neues Passwort bestätigen" required style={styles.inputModal}/>
              {error && <p style={{color: 'red', fontSize: '0.9rem'}}>{error}</p>}
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{...styles.button, ...styles.buttonSecondary}}>Abbrechen</button>
                <button type="submit" disabled={isUpdating} style={styles.button}>{isUpdating ? 'Wird geändert...' : 'Ändern'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f3f4', padding: '20px 0' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
    spinner: { width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #ef5c22', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    card: { padding: '40px 50px', borderRadius: '12px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '700px', textAlign: 'left' },
    title: { fontSize: '2.2rem', color: '#2c3e50', marginBottom: '20px', textAlign: 'center' },
    profileList: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' },
    profileItem: { display: 'grid', gridTemplateColumns: '250px 1fr', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    label: { fontWeight: 600, color: '#555' },
    input: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
    button: { padding: '12px 18px', borderRadius: '8px', border: 'none', background: '#ef5c22', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: 500, width: '100%' },
    buttonSecondary: { background: '#f0f2f5', color: '#2c3e50', border: '1px solid #ddd' },
    actions: { display: 'flex', gap: '15px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalContent: { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    inputModal: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '10px' },
    successMessage: { color: '#27ae60', textAlign: 'center', marginBottom: '15px', background: '#e9f7ef', padding: '10px', borderRadius: '8px' }, 
    errorMessage: { color: '#c0392b', textAlign: 'center', marginBottom: '15px', background: '#fee', padding: '10px', borderRadius: '8px' },
};