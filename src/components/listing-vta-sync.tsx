"use client";

import { useEffect } from "react";

import { VTA_STORAGE_KEY, vtaCookieValue } from "@/lib/listing-vta";

/** Copy the cookie vta set into `iss:vta-listing-ids` after a no-JS POST. */
export function SyncVta({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        VTA_STORAGE_KEY,
        vtaCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
