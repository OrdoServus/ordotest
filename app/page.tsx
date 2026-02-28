'use client';
import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Root page – redirects to /dashboard (logged in) or /info (logged out).
 * Eliminates the duplicate Dashboard code that existed here previously.
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/info');
    }
  }, [user, loading, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#7f8c8d', fontSize: '1.1rem' }}>
      Wird geladen…
    </div>
  );
}
