"use client";

import { useEffect } from "react";

import { GAMUT_STORAGE_KEY, gamutCookieValue } from "@/lib/listing-gamut";

/** Copy the cookie gamut set into `iss:gamut-listing-ids` after a no-JS POST. */
export function SyncGamut({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GAMUT_STORAGE_KEY,
        gamutCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
