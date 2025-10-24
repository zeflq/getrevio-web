// app/providers.tsx (client)
"use client";

import { QueryProvider } from "@/shared/lib/react-query";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ className: "z-[10000]" }}
      />
    </QueryProvider>
  );
}
