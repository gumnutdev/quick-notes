"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import React from "react";

const GUMNUT_ON = false;

function GumnutProvider({ children }: { children: React.ReactNode }) {
  if (GUMNUT_ON) {
    useEffect(() => {
      configureGumnut({
        localDevKey: "your-key-here",
        projectId: "your-project-id-here",
      });
    }, []);
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: true, // Ensure refetch on mount
            refetchOnReconnect: true, // Refetch when reconnecting
          },
        },
      })
  );

  return (
    <GumnutProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GumnutProvider>
  );
}
