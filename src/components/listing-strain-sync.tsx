"use client";

import { useEffect } from "react";

import { STRAIN_STORAGE_KEY, strainCookieValue } from "@/lib/listing-strain";

/** Copy the cookie strain set into `iss:strain-listing-ids` after a no-JS POST. */
export function SyncStrain({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STRAIN_STORAGE_KEY,
        strainCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
