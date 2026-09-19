"use client";

import { useEffect } from "react";

import { STITCH_STORAGE_KEY, stitchCookieValue } from "@/lib/listing-stitch";

/** Copy the cookie stitch set into `iss:stitch-listing-ids` after a no-JS POST. */
export function SyncStitch({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(STITCH_STORAGE_KEY, stitchCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
