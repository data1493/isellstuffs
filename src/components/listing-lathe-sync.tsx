"use client";

import { useEffect } from "react";

import { LATHE_STORAGE_KEY, latheCookieValue } from "@/lib/listing-lathe";

/** Copy the cookie lathe set into `iss:lathe-listing-ids` after a no-JS POST. */
export function SyncLathe({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LATHE_STORAGE_KEY, latheCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
