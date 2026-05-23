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
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-slate-950/95 px-6 py-5 shadow-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <p className="text-sm font-semibold text-white">Loading…</p>
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
                  <div className="flex flex-col items-center gap-3 rounded-3xl bg-slate-950/95 px-6 py-5 shadow-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-sm font-semibold text-white">Loading…</p>
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
