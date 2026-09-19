"use client";

import { useEffect } from "react";

import { FLUX_STORAGE_KEY, fluxCookieValue } from "@/lib/listing-flux";

/** Copy the cookie flux set into `iss:flux-listing-ids` after a no-JS POST. */
export function SyncFlux({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FLUX_STORAGE_KEY,
        fluxCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
