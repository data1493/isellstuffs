"use client";

import { useEffect } from "react";

import { TAP_STORAGE_KEY, tapCookieValue } from "@/lib/listing-tap";

/** Copy the cookie tap set into `iss:tap-listing-ids` after a no-JS POST. */
export function SyncTap({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TAP_STORAGE_KEY,
        tapCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
