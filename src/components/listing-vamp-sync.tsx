"use client";

import { useEffect } from "react";

import { VAMP_STORAGE_KEY, vampCookieValue } from "@/lib/listing-vamp";

/** Copy the cookie vamp set into `iss:vamp-listing-ids` after a no-JS POST. */
export function SyncVamp({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(VAMP_STORAGE_KEY, vampCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
