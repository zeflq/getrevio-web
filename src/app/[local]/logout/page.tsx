"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    signOut({
      fetchOptions: {
        onSuccess: () => {
          if (!cancelled) router.replace("/login");
        },
      },
    }).catch(() => {
      if (!cancelled) router.replace("/login");
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-xl font-semibold">Signing you out…</h1>
      <p className="text-sm text-muted-foreground">
        Hang tight—we&apos;re clearing your session and redirecting you to login.
      </p>
    </div>
  );
}
