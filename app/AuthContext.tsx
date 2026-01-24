'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth, db } from './login/firebaseClient';
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from 'next/navigation';

interface ProfileData {
  name?: string;
  funktion?: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect handles the initial authentication and redirection.
    const handleAuth = async () => {
      // 1. Handle Magic Link Sign-In
      if (isSignInWithEmailLink(auth, window.location.href) && !user) {
        setLoading(true);
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Für die Bestätigung, geben Sie bitte Ihre E-Mail an.');
        }
        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // The onAuthStateChanged listener below will handle the user object and profile check.
          } catch (error) {
            console.error("Error signing in with email link", error);
            alert("Anmeldung fehlgeschlagen. Versuchen Sie es erneut.");
            router.push('/login');
          }
        }
        return; // Early exit to wait for onAuthStateChanged
      }

      // 2. Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUser(user);
          // Check for user profile data in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const profileData = docSnap.data() as ProfileData;
            setProfile(profileData);
            // If essential profile data is missing, redirect to profile page
            if (!profileData.name && pathname !== '/profile') {
              router.push('/profile');
            }
          } else {
            // No profile found, redirect to create one
            setProfile(null);
            if (pathname !== '/profile') {
              router.push('/profile');
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    handleAuth();
  }, [router, pathname, user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
