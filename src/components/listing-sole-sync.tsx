"use client";

import { useEffect } from "react";

import { SOLE_STORAGE_KEY, soleCookieValue } from "@/lib/listing-sole";

/** Copy the cookie sole set into `iss:sole-listing-ids` after a no-JS POST. */
export function SyncSole({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SOLE_STORAGE_KEY, soleCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
