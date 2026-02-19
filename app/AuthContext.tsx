'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  logout: async () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Logout Funktion mit Fehlerbehandlung
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // Erfolgreich ausgeloggt - State wird durch onAuthStateChanged aktualisiert
    } catch (error) {
      console.error('Logout error:', error);
      throw error; // Fehler weitergeben für UI-Feedback
    }
  }, []);

  // Computed property für einfacheren Zugriff
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook mit Fehlerbehandlung
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
  }
  return context;
};
