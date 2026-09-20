"use client";

import { useEffect } from "react";

import { COGGLE_STORAGE_KEY, coggleCookieValue } from "@/lib/listing-coggle";

/** Copy the cookie coggle set into `iss:coggle-listing-ids` after a no-JS POST. */
export function SyncCoggle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        COGGLE_STORAGE_KEY,
        coggleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
