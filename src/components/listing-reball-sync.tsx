"use client";

import { useEffect } from "react";

import { REBALL_STORAGE_KEY, reballCookieValue } from "@/lib/listing-reball";

/** Copy the cookie reball set into `iss:reball-listing-ids` after a no-JS POST. */
export function SyncReball({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        REBALL_STORAGE_KEY,
        reballCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
