"use client";

import { useEffect } from "react";

import { SOAK_STORAGE_KEY, soakCookieValue } from "@/lib/listing-soak";

/** Copy the cookie soak set into `iss:soak-listing-ids` after a no-JS POST. */
export function SyncSoak({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SOAK_STORAGE_KEY,
        soakCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
