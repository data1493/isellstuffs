"use client";

import { useEffect } from "react";

import { ETCH_STORAGE_KEY, etchCookieValue } from "@/lib/listing-etch";

/** Copy the cookie etch set into `iss:etch-listing-ids` after a no-JS POST. */
export function SyncEtch({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(ETCH_STORAGE_KEY, etchCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
