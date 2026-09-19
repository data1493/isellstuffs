"use client";

import { useEffect } from "react";

import { HANDS_STORAGE_KEY, handsCookieValue } from "@/lib/in-hands";

/** Copy the cookie hands set into `iss:hands-listing-ids` after a no-JS POST. */
export function SyncHands({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        HANDS_STORAGE_KEY,
        handsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
