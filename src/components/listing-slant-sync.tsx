"use client";

import { useEffect } from "react";

import { SLANT_STORAGE_KEY, slantCookieValue } from "@/lib/listing-slant";

/** Copy the cookie slant set into `iss:slant-listing-ids` after a no-JS POST. */
export function SyncSlant({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SLANT_STORAGE_KEY,
        slantCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
