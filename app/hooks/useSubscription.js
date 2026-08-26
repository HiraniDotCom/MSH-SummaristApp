"use client";

import { useAuth } from "@/app/context/AuthContext";

/**
 * Hook to get the current user's subscription status.
 * Returns:
 *  - subscription: "none" | "pro" | "premium" | null
 *  - loading: boolean
 */
export function useSubscription() {
  const { user, authLoading } = useAuth();

  return { 
    user,
    subscription: user?.subscribed || "none",
    authLoading, 
  };
}
