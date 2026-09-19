"use client";

import { useEffect } from "react";

import { TINES_STORAGE_KEY, tinesCookieValue } from "@/lib/listing-tines";

/** Copy the cookie tines set into `iss:tines-listing-ids` after a no-JS POST. */
export function SyncTines({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(TINES_STORAGE_KEY, tinesCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
