"use client";

import { useEffect } from "react";

import { EVEN_STORAGE_KEY, evenCookieValue } from "@/lib/listing-even";

/** Copy the cookie even set into `iss:even-listing-ids` after a no-JS POST. */
export function SyncEven({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(EVEN_STORAGE_KEY, evenCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
