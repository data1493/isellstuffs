"use client";

import { useEffect } from "react";

import { DUST_STORAGE_KEY, dustCookieValue } from "@/lib/listing-dust";

/** Copy the cookie dust set into `iss:dust-listing-ids` after a no-JS POST. */
export function SyncDust({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DUST_STORAGE_KEY, dustCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
