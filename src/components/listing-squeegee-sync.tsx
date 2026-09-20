"use client";

import { useEffect } from "react";

import { SQUEEGEE_STORAGE_KEY, squeegeeCookieValue } from "@/lib/listing-squeegee";

/** Copy the cookie squeegee set into `iss:squeegee-listing-ids` after a no-JS POST. */
export function SyncSqueegee({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SQUEEGEE_STORAGE_KEY,
        squeegeeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
