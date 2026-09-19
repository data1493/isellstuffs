"use client";

import { useEffect } from "react";

import { CORD_STORAGE_KEY, cordCookieValue } from "@/lib/listing-cord";

/** Copy the cookie rewire set into `iss:cord-listing-ids` after a no-JS POST. */
export function SyncCord({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CORD_STORAGE_KEY,
        cordCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
