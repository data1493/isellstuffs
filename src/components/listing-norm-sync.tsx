"use client";

import { useEffect } from "react";

import { NORM_STORAGE_KEY, normCookieValue } from "@/lib/listing-norm";

/** Copy the cookie norm set into `iss:norm-listing-ids` after a no-JS POST. */
export function SyncNorm({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        NORM_STORAGE_KEY,
        normCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
