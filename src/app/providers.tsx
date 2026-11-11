'use client';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { isSigningOut } from '@/features/auth/api';
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const onError = (error: Error) => {
      if (error instanceof ApiError && error.status === 401)
        window.dispatchEvent(new Event('idoc:session-expired'));
    };
    const queryClient = new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: { queries: { retry: false, staleTime: 15_000 }, mutations: { retry: false } },
    });
    return queryClient;
  });
  useEffect(() => {
    const expire = () => {
      if (isSigningOut()) return;
      if (!['/chat', '/documents', '/dashboard', '/profile'].includes(window.location.pathname))
        return;
      client.clear();
      window.location.replace('/login?reason=expired');
    };
    window.addEventListener('idoc:session-expired', expire);
    return () => {
      window.removeEventListener('idoc:session-expired', expire);
    };
  }, [client]);
  return (
    <QueryClientProvider client={client}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  );
}
