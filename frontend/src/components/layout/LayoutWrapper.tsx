'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider, useIsFetching } from '@tanstack/react-query';
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

  return (
    <QueryClientProvider client={queryClient}>
      <LayoutContent>{children}</LayoutContent>
    </QueryClientProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFetching = useIsFetching();
  const isPublicRoute = ['/login', '/register'].includes(pathname);
  const isGlobalLoading = isFetching > 0;

  return (
    <ProtectedRoute>
      {isPublicRoute ? (
        <main className="w-full h-full relative">
          {children}
          {isGlobalLoading && (
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
              <div className="w-[min(92%,420px)] animate-pulse rounded-3xl bg-slate-950/95 p-6 shadow-2xl border border-white/10">
                <div className="h-3 rounded-full bg-white/10" />
                <div className="mt-3 h-3 rounded-full bg-white/10 w-3/4" />
                <div className="mt-4 h-12 rounded-2xl bg-white/10" />
                <div className="mt-4 h-3 rounded-full bg-white/10 w-2/3" />
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <Header />
            <main className="flex-1 overflow-y-auto p-8 bg-mesh relative">
              {children}
              {isGlobalLoading && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40">
                  <div className="w-[min(92%,420px)] animate-pulse rounded-3xl bg-slate-950/95 p-6 shadow-2xl border border-white/10">
                    <div className="h-3 rounded-full bg-white/10" />
                    <div className="mt-3 h-3 rounded-full bg-white/10 w-3/4" />
                    <div className="mt-4 h-12 rounded-2xl bg-white/10" />
                    <div className="mt-4 h-3 rounded-full bg-white/10 w-2/3" />
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
