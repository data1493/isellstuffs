"use client";

import { useEffect } from "react";

import { DRESS_STORAGE_KEY, dressCookieValue } from "@/lib/listing-dress";

/** Copy the cookie dress set into `iss:dress-listing-ids` after a no-JS POST. */
export function SyncDress({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DRESS_STORAGE_KEY,
        dressCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
