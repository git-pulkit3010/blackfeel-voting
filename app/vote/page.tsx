'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import MinimalistDuel from "@/components/MinimalistDuel";

export default function VotePage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      {/* User info bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <span className="text-text-secondary text-sm">{user?.email}</span>
        <button
          onClick={async () => {
            await logout();
            router.push('/auth');
          }}
          className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-dark rounded-lg hover:text-white hover:border-gray-500 transition-all"
        >
          Sign Out
        </button>
      </div>
      <MinimalistDuel />
    </div>
  );
}