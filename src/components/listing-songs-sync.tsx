"use client";

import { useEffect } from "react";

import { SONGS_STORAGE_KEY, songsCookieValue } from "@/lib/listing-songs";

/** Copy the cookie songs set into `iss:songs-listing-ids` after a no-JS POST. */
export function SyncSongs({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SONGS_STORAGE_KEY, songsCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
