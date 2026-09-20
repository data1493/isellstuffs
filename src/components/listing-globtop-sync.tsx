"use client";

import { useEffect } from "react";

import { GLOBTOP_STORAGE_KEY, globtopCookieValue } from "@/lib/listing-globtop";

/** Copy the cookie globtop set into `iss:globtop-listing-ids` after a no-JS POST. */
export function SyncGlobtop({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GLOBTOP_STORAGE_KEY,
        globtopCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
