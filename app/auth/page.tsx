'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthPage } from '@/components/auth/AuthPage';
import { useAuth } from '@/components/auth/AuthContext';

export default function AuthPageRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/vote');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <AuthPage />;
}
