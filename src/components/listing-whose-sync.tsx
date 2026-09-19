"use client";

import { useEffect } from "react";

import { WHOSE_STORAGE_KEY, whoseCookieValue } from "@/lib/listing-whose";

/** Copy the cookie whose set into `iss:whose-listing-ids` after a no-JS POST. */
export function SyncWhose({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(WHOSE_STORAGE_KEY, whoseCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
