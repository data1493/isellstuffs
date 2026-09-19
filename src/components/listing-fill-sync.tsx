"use client";

import { useEffect } from "react";

import { FILL_STORAGE_KEY, fillCookieValue } from "@/lib/listing-fill";

/** Copy the cookie fill set into `iss:fill-listing-ids` after a no-JS POST. */
export function SyncFill({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(FILL_STORAGE_KEY, fillCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
