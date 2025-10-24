"use client";

import * as React from "react";

import { useSession } from "@/lib/auth-client";
import { SUPER_ADMIN } from "@/lib/utils";

const DEFAULT_AVATAR = "/avatars/placeholder.png";

export type SidebarUserProfile = {
  name: string;
  email: string;
  avatar: string;
  loading: boolean;
  isSuperAdmin: boolean;
};

export function useSidebarUser() {
  const sessionState = useSession();
  const { data: session, isPending } = sessionState;

  const user = React.useMemo<SidebarUserProfile>(() => {
    if (isPending) {
      return {
        name: "Loading…",
        email: "",
        avatar: DEFAULT_AVATAR,
        loading: true,
        isSuperAdmin: false,
      };
    }

    const authUser = session?.user;

    return {
      name: authUser?.name ?? authUser?.email?.split("@")[0] ?? "User",
      email: authUser?.email ?? "",
      avatar: (authUser as any)?.image ?? DEFAULT_AVATAR,
      loading: false,
      isSuperAdmin: (authUser as any)?.globalRole === SUPER_ADMIN,
    };
  }, [session, isPending]);

  return {
    session,
    isPending,
    user,
  };
}
