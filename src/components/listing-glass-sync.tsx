"use client";

import { useEffect } from "react";

import { GLASS_STORAGE_KEY, glassCookieValue } from "@/lib/listing-glass";

/** Copy the cookie glass set into `iss:glass-listing-ids` after a no-JS POST. */
export function SyncGlass({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(GLASS_STORAGE_KEY, glassCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
