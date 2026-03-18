'use client';
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import type { Org } from './index';
import { getUserOrgs, createOrg, createService } from './index';


export default function GdLanding() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadOrgs();
    setLoading(false);
  }, [user, router]);

  const loadOrgs = async () => {
    if (!user) return;
    const userOrgs = await getUserOrgs(user.uid);
    setOrgs(userOrgs);
  };

  const handleNewService = async () => {
    if (!user) return;
    setCreating(true);
    try {
      // Use first org or create default
      let orgId: string;
      if (orgs.length === 0) {
        orgId = await createOrg(user.uid, 'Meine Organisation');
      } else {
        orgId = orgs[0].id;
      }

      // Create service
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const serviceId = await createService(orgId, user.uid, {
        title: 'Neuer Gottesdienst',
        date: dateStr,
        location: '',
      });

      router.push(`/gd/${orgId}/${serviceId}`);
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      alert('Fehler beim Erstellen des Gottesdienstes');
    } finally {
      setCreating(false);
    }
  };


  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        Lädt Gottesdienste...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Gottesdienste</h1>
        <p style={styles.subtitle}>Liturgieplaner mit Bausteinen</p>
      </header>

      <div style={styles.banner}>
        <strong>Neu:</strong> Gottesdienstplanung mit drag & drop Bausteinen (Lesungen, Lieder, Gebete).
      </div>

      <div style={styles.cta}>
        <button 
          onClick={handleNewService} 
          disabled={creating}
          style={{
            ...styles.ctaBtn,
            backgroundColor: creating ? '#bdc3c7' : '#3498db',
            cursor: creating ? 'not-allowed' : 'pointer'
          }}
        >
          {creating ? 'Erstelle...' : 'Neuen Gottesdienst erstellen'}
        </button>
        <p style={styles.ctaNote}>
          {orgs.length === 0 ? 'Erstelle deine erste Organisation & Gottesdienst' : `${orgs.length} Organisation(en)`}
        </p>
      </div>


      <div style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>🧩</div>
          <h3 style={styles.featureTitle}>Bausteine</h3>
          <p>Lesungen, Lieder, Gebete – modular kombinieren</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>📤</div>
          <h3 style={styles.featureTitle}>Export</h3>
          <p>PDF, Website, Druck – einsatzbereit</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>👥</div>
          <h3 style={styles.featureTitle}>Organisationen</h3>
          <p>Pfarrei, Gemeinde, Team – getrennte Pläne</p>
        </div>
      </div>

      <footer style={styles.footer}>
        <a href="/dashboard" style={styles.backLink}>← Zurück zum Dashboard</a>
      </footer>

    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { 
    flex: 1, backgroundColor: '#f9f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' 
  },
  loading: { 
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' 
  },
  spinner: { 
    width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  header: { textAlign: 'center', padding: '50px 20px 30px' },
  h1: { fontSize: '2.5rem', color: '#2c3e50', margin: 0 },
  subtitle: { color: '#7f8c8d', fontSize: '1.2rem', margin: '0 0 40px' },
  banner: { 
    backgroundColor: '#e8f4fd', border: '1px solid #3498db', borderRadius: '12px', padding: '20px 30px', 
    marginBottom: '40px', textAlign: 'center', maxWidth: '800px', boxShadow: '0 4px 12px rgba(52,152,219,0.1)' 
  },
  cta: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '60px', 
    maxWidth: '500px' 
  },
  ctaBtn: { 
    backgroundColor: '#3498db', color: 'white', padding: '16px 40px', borderRadius: '12px', 
    fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 8px 24px rgba(52,152,219,0.3)',
    transition: 'transform 0.2s' 
  },
  ctaNote: { color: '#7f8c8d', fontSize: '1rem', textAlign: 'center', margin: 0 },
  features: { 
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', 
    maxWidth: '1000px', width: '100%' 
  },
  feature: { 
    backgroundColor: 'white', padding: '32px', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', 
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' 
  },
  featureIcon: { fontSize: '3rem' },
  featureTitle: { margin: 0, fontSize: '1.3rem', color: '#2c3e50', fontWeight: 700 },
  footer: { 
    padding: '40px 20px', textAlign: 'center', color: '#7f8c8d', marginTop: 'auto', width: '100%' 
  },
  backLink: { 
    color: '#3498db', textDecoration: 'none', fontWeight: '500', fontSize: '1rem' 
  }
};

