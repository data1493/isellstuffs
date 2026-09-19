"use client";

import { useEffect } from "react";

import { BAKE_STORAGE_KEY, bakeCookieValue } from "@/lib/listing-bake";

/** Copy the cookie bake set into `iss:bake-listing-ids` after a no-JS POST. */
export function SyncBake({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(BAKE_STORAGE_KEY, bakeCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
