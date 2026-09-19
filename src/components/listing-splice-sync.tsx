"use client";

import { useEffect } from "react";

import { SPLICE_STORAGE_KEY, spliceCookieValue } from "@/lib/listing-splice";

/** Copy the cookie splice set into `iss:splice-listing-ids` after a no-JS POST. */
export function SyncSplice({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SPLICE_STORAGE_KEY, spliceCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
