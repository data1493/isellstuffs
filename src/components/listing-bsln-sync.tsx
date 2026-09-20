"use client";

import { useEffect } from "react";

import { BSLN_STORAGE_KEY, bslnCookieValue } from "@/lib/listing-bsln";

/** Copy the cookie bsln set into `iss:bsln-listing-ids` after a no-JS POST. */
export function SyncBsln({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BSLN_STORAGE_KEY,
        bslnCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
