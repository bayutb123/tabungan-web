'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, initAnalytics } from '@/lib/firebase/client';
import { signInWithGoogle as signIn, signOutUser as signOut, upsertUserProfile } from '@/lib/firebase/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAnalytics().catch(() => {
      // Analytics bersifat opsional untuk MVP.
    });
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        await upsertUserProfile(nextUser);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signInWithGoogle: async () => {
        await signIn();
      },
      signOutUser: async () => {
        await signOut();
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider belum dipasang.');
  return context;
}
