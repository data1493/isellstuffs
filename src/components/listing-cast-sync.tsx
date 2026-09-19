"use client";

import { useEffect } from "react";

import { CAST_STORAGE_KEY, castCookieValue } from "@/lib/listing-cast";

/** Copy the cookie cast set into `iss:cast-listing-ids` after a no-JS POST. */
export function SyncCast({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CAST_STORAGE_KEY, castCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
