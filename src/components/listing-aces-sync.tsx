"use client";

import { useEffect } from "react";

import { ACES_STORAGE_KEY, acesCookieValue } from "@/lib/listing-aces";

/** Copy the cookie aces set into `iss:aces-listing-ids` after a no-JS POST. */
export function SyncAces({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ACES_STORAGE_KEY,
        acesCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
