'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const onError = (error: Error) => {
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        !window.location.pathname.startsWith('/login')
      ) {
        queryClient.clear();
        window.location.replace('/login?reason=expired');
      }
    };
    const queryClient = new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: { queries: { retry: false, staleTime: 15_000 }, mutations: { retry: false } },
    });
    return queryClient;
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
