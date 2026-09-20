"use client";

import { useEffect } from "react";

import { TRUSS_STORAGE_KEY, trussCookieValue } from "@/lib/listing-truss";

/** Copy the cookie truss set into `iss:truss-listing-ids` after a no-JS POST. */
export function SyncTruss({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TRUSS_STORAGE_KEY,
        trussCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
