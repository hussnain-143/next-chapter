'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const publicRoutes = ['/login', '/register'];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!token && !isPublicRoute) {
        router.push('/login');
      } else if (token && isPublicRoute) {
        router.push('/');
      }
    }
  }, [user, token, pathname, router, mounted]);

  // Avoid rendering protected content or flickering on initial mount
  if (!mounted) return null;
  
  const isPublicRoute = ['/login', '/register'].includes(pathname);
  if (!token && !isPublicRoute) return null;

  return <>{children}</>;
}
