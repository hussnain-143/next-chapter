'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '../ProtectedRoute';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: 1 },
    },
  }));

  const pathname = usePathname();
  const isPublicRoute = ['/login', '/register'].includes(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedRoute>
        {isPublicRoute ? (
          <main className="w-full h-full">{children}</main>
        ) : (
          <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <Header />
              <main className="flex-1 overflow-y-auto p-8 bg-mesh">
                {children}
              </main>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </QueryClientProvider>
  );
}
