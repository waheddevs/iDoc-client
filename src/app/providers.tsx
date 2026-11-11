'use client';
import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
export function Providers({ children }: { children: React.ReactNode }) {
  const signingOut = useRef(false);
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
      if (signingOut.current) return;
      if (!['/chat', '/documents', '/dashboard', '/profile'].includes(window.location.pathname)) return;
      client.clear();
      window.location.replace('/login?reason=expired');
    };
    window.addEventListener('idoc:session-expired', expire);
    const beginLogout = () => {
      signingOut.current = true;
    };
    const failedLogout = () => {
      signingOut.current = false;
    };
    window.addEventListener('idoc:signing-out', beginLogout);
    window.addEventListener('idoc:sign-out-failed', failedLogout);
    return () => {
      window.removeEventListener('idoc:session-expired', expire);
      window.removeEventListener('idoc:signing-out', beginLogout);
      window.removeEventListener('idoc:sign-out-failed', failedLogout);
    };
  }, [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
