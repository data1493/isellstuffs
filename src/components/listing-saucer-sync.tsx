"use client";

import { useEffect } from "react";

import { SAUCER_STORAGE_KEY, saucerCookieValue } from "@/lib/listing-saucer";

/** Copy the cookie saucer set into `iss:saucer-listing-ids` after a no-JS POST. */
export function SyncSaucer({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SAUCER_STORAGE_KEY, saucerCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
