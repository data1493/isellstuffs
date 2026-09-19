"use client";

import { useEffect } from "react";

import { BOLD_STORAGE_KEY, boldCookieValue } from "@/lib/listing-bold";

/** Copy the cookie bold set into `iss:bold-listing-ids` after a no-JS POST. */
export function SyncBold({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(BOLD_STORAGE_KEY, boldCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
