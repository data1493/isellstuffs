"use client";

import { useEffect } from "react";

import { FOAM_STORAGE_KEY, foamCookieValue } from "@/lib/listing-foam";

/** Copy the cookie foam set into `iss:foam-listing-ids` after a no-JS POST. */
export function SyncFoam({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(FOAM_STORAGE_KEY, foamCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
