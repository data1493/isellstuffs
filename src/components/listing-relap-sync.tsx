"use client";

import { useEffect } from "react";

import { RELAP_STORAGE_KEY, relapCookieValue } from "@/lib/listing-relap";

/** Copy the cookie relap set into `iss:relap-listing-ids` after a no-JS POST. */
export function SyncRelap({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RELAP_STORAGE_KEY,
        relapCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
