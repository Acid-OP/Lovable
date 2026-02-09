"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic refetching on window focus for better UX
        refetchOnWindowFocus: false,
        // Retry failed requests once
        retry: 1,
        // Cache data for 5 minutes
        staleTime: 5 * 60 * 1000,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance for each request to avoid sharing state between users
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
