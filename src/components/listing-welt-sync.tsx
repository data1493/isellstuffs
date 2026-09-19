"use client";

import { useEffect } from "react";

import { WELT_STORAGE_KEY, weltCookieValue } from "@/lib/listing-welt";

/** Copy the cookie welt set into `iss:welt-listing-ids` after a no-JS POST. */
export function SyncWelt({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(WELT_STORAGE_KEY, weltCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
