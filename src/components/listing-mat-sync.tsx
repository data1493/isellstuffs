"use client";

import { useEffect } from "react";

import { MAT_STORAGE_KEY, matCookieValue } from "@/lib/listing-mat";

/** Copy the cookie mat set into `iss:mat-listing-ids` after a no-JS POST. */
export function SyncMat({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(MAT_STORAGE_KEY, matCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
