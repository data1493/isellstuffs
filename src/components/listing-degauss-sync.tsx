"use client";

import { useEffect } from "react";

import { DEGAUSS_STORAGE_KEY, degaussCookieValue } from "@/lib/listing-degauss";

/** Copy the cookie degauss set into `iss:degauss-listing-ids` after a no-JS POST. */
export function SyncDegauss({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DEGAUSS_STORAGE_KEY,
        degaussCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
