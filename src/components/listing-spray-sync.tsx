"use client";

import { useEffect } from "react";

import { SPRAY_STORAGE_KEY, sprayCookieValue } from "@/lib/listing-spray";

/** Copy the cookie spray set into `iss:spray-listing-ids` after a no-JS POST. */
export function SyncSpray({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SPRAY_STORAGE_KEY, sprayCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
