"use client";

import { useEffect } from "react";

import { KEY_STORAGE_KEY, keyCookieValue } from "@/lib/listing-key";

/** Copy the cookie key set into `iss:key-listing-ids` after a no-JS POST. */
export function SyncKey({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY_STORAGE_KEY, keyCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
