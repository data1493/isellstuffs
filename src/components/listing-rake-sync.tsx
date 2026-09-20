"use client";

import { useEffect } from "react";

import { RAKE_STORAGE_KEY, rakeCookieValue } from "@/lib/listing-rake";

/** Copy the cookie rake set into `iss:rake-listing-ids` after a no-JS POST. */
export function SyncRake({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(RAKE_STORAGE_KEY, rakeCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
