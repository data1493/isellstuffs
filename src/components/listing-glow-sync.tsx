"use client";

import { useEffect } from "react";

import { GLOW_STORAGE_KEY, glowCookieValue } from "@/lib/listing-glow";

/** Copy the cookie glow set into `iss:glow-listing-ids` after a no-JS POST. */
export function SyncGlow({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GLOW_STORAGE_KEY,
        glowCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
