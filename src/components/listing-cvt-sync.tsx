"use client";

import { useEffect } from "react";

import { CVT_STORAGE_KEY, cvtCookieValue } from "@/lib/listing-cvt";

/** Copy the cookie cvt set into `iss:cvt-listing-ids` after a no-JS POST. */
export function SyncCvt({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CVT_STORAGE_KEY,
        cvtCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
