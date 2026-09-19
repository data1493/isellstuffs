"use client";

import { useEffect } from "react";

import { GREASE_STORAGE_KEY, greaseCookieValue } from "@/lib/listing-grease";

/** Copy the cookie grease set into `iss:grease-listing-ids` after a no-JS POST. */
export function SyncGrease({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GREASE_STORAGE_KEY,
        greaseCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
