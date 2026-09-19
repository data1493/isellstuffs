"use client";

import { useEffect } from "react";

import { BRAID_STORAGE_KEY, braidCookieValue } from "@/lib/listing-braid";

/** Copy the cookie braid set into `iss:braid-listing-ids` after a no-JS POST. */
export function SyncBraid({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(BRAID_STORAGE_KEY, braidCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
