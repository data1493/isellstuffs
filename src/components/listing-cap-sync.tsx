"use client";

import { useEffect } from "react";

import { CAP_STORAGE_KEY, capCookieValue } from "@/lib/listing-cap";

/** Copy the cookie cap set into `iss:cap-listing-ids` after a no-JS POST. */
export function SyncCap({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CAP_STORAGE_KEY, capCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
