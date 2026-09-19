"use client";

import { useEffect } from "react";

import { VIBE_STORAGE_KEY, vibeCookieValue } from "@/lib/listing-vibe";

/** Copy the cookie vibe set into `iss:vibe-listing-ids` after a no-JS POST. */
export function SyncVibe({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        VIBE_STORAGE_KEY,
        vibeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
