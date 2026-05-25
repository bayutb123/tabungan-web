'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from './LoadingState';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, router, user]);

  if (loading) return <LoadingState message="Memeriksa sesi..." />;
  if (!user) return null;

  return <>{children}</>;
}
