"use client";

import { useEffect } from "react";

import { PLAYS_STORAGE_KEY, playsCookieValue } from "@/lib/listing-plays";

/** Copy the cookie play-count set into `iss:plays-listing-ids` after a no-JS POST. */
export function SyncPlays({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PLAYS_STORAGE_KEY,
        playsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
