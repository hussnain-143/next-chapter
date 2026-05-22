'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      const publicRoutes = ['/login', '/register'];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!token && !isPublicRoute) {
        router.push('/login');
      } else if (token && isPublicRoute) {
        router.push('/');
      }
    }
  }, [user, token, pathname, router, hydrated]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-sm font-semibold">Loading user session…</p>
        </div>
      </div>
    );
  }

  const isPublicRoute = ['/login', '/register'].includes(pathname);
  if (!token && !isPublicRoute) return null;

  return <>{children}</>;
}
