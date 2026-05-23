'use client';

import SkeletonLoader from '@/components/ui/SkeletonLoader';
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
    return <SkeletonLoader message="Loading user session…" />;
  }

  const isPublicRoute = ['/login', '/register'].includes(pathname);
  if (!token && !isPublicRoute) return null;

  return <>{children}</>;
}
