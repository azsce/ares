"use client";

import { signOut } from "next-auth/react";
import { performLogoutCleanup } from "@/utils/auth-cleanup";
import { SessionProvider } from "next-auth/react";
import { Component, type ReactNode } from "react";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";

class JwtErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error.message.includes("decryption operation failed") || error.message.includes("JWEDecryptionFailed")) {
      performLogoutCleanup();
      void signOut({ redirect: false }).then(() => {
        // Clear the stale cookie and reload cleanly
        window.location.reload();
      });
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function SessionMonitor({ children }: { readonly children: ReactNode }) {
  useSessionMonitor();
  return <>{children}</>;
}

export default function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  return (
    <JwtErrorBoundary>
      <SessionProvider>
        <SessionMonitor>{children}</SessionMonitor>
      </SessionProvider>
    </JwtErrorBoundary>
  );
}
