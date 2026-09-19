"use client";

import { useEffect } from "react";

import { SAND_STORAGE_KEY, sandCookieValue } from "@/lib/listing-sand";

/** Copy the cookie sand set into `iss:sand-listing-ids` after a no-JS POST. */
export function SyncSand({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SAND_STORAGE_KEY, sandCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
