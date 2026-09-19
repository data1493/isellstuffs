"use client";

import { useEffect } from "react";

import { STEMS_STORAGE_KEY, stemsCookieValue } from "@/lib/listing-stems";

/** Copy the cookie shot-count set into `iss:stems-listing-ids` after a no-JS POST. */
export function SyncStems({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STEMS_STORAGE_KEY,
        stemsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
