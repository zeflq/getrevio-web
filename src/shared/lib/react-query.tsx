'use client';

import { PropsWithChildren, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useReadableError } from '@/lib/useReadableError';

/**
 * Provides a global QueryClient with localized, safe error handling.
 */
export function QueryProvider({ children }: PropsWithChildren) {
  const readableError = useReadableError(); // ✅ use the localized error hook

  // ⚠️ Note: We must create the QueryClient *inside* the component to access hooks
  const [client] = useState(() => {
    return new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          toast.error(readableError(error, 'generic'));
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          toast.error(readableError(error, 'generic'));
        },
      }),
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
          staleTime: 30_000,
        },
      },
    });
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
