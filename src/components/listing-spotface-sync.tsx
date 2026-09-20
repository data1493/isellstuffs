"use client";

import { useEffect } from "react";

import { SPOTFACE_STORAGE_KEY, spotfaceCookieValue } from "@/lib/listing-spotface";

/** Copy the cookie spotface set into `iss:spotface-listing-ids` after a no-JS POST. */
export function SyncSpotface({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SPOTFACE_STORAGE_KEY,
        spotfaceCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
