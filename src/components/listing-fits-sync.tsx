"use client";

import { useEffect } from "react";

import { FITS_STORAGE_KEY, fitsCookieValue } from "@/lib/listing-fits";

/** Copy the cookie 3-quart set into `iss:fits-listing-ids` after a no-JS POST. */
export function SyncFits({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FITS_STORAGE_KEY,
        fitsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
