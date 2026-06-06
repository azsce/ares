"use client";

import { useSession, signOut } from "next-auth/react";
import { performLogoutCleanup } from "@/utils/auth-cleanup";
import { useEffect, useRef } from "react";

export function useSessionMonitor() {
  const { data: session, status } = useSession();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    // Only check for errors when we have an authenticated session
    if (status === "authenticated" && session.error === "RefreshAccessTokenError" && !hasLoggedOut.current) {
      hasLoggedOut.current = true;
      performLogoutCleanup();
      void signOut({ callbackUrl: "/sign-in?error=session_expired" });
    }
  }, [session, status]);
}
