"use client";

import { useEffect } from "react";

import { GALLEY_STORAGE_KEY, galleyCookieValue } from "@/lib/listing-galley";

/** Copy the cookie galley set into `iss:galley-listing-ids` after a no-JS POST. */
export function SyncGalley({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GALLEY_STORAGE_KEY,
        galleyCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
