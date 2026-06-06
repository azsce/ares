"use client";

import { logger } from "@/utils/logger";

/**
 * Cleans up user-related data from storage on logout.
 * This ensures that cart/checkout state and other personal data
 * don't leak between different user sessions.
 *
 * It clears specifically targeted keys from sessionStorage and
 * clears localStorage while preserving non-user-specific preferences
 * like theme mode.
 */
export function performLogoutCleanup() {
  if (typeof window === "undefined") return;

  try {
    // 1. Clear Cart/Checkout data (sessionStorage)
    // 'bookingIntent' and 'checkoutBookingId' are the main checkout-related keys
    sessionStorage.removeItem("bookingIntent");
    sessionStorage.removeItem("checkoutBookingId");

    // 2. Clear all sessionStorage to be safe (scoped to the current tab/session)
    // This is generally safe as sessionStorage is meant to be transient.
    sessionStorage.clear();

    // 3. Selective localStorage cleanup
    // We want to clear user-specific data but preserve global preferences.
    // Currently, 'theme-mode' is the only known global preference.
    const themeMode = localStorage.getItem("theme-mode");

    localStorage.clear();

    // Restore preserved preferences
    if (themeMode) {
      localStorage.setItem("theme-mode", themeMode);
    }

    logger.info("Auth cleanup: User-specific storage cleared successfully.");
  } catch (error) {
    logger.error("Auth cleanup: Failed to clear storage:", error);
  }
}
