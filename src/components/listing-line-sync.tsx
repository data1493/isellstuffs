"use client";

import { useEffect } from "react";

import { LINE_STORAGE_KEY, lineCookieValue } from "@/lib/listing-line";

/** Copy the cookie line set into `iss:line-listing-ids` after a no-JS POST. */
export function SyncLine({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(LINE_STORAGE_KEY, lineCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
