"use client";

import { useEffect } from "react";

import { HONE_STORAGE_KEY, honeCookieValue } from "@/lib/listing-hone";

/** Copy the cookie hone set into `iss:hone-listing-ids` after a no-JS POST. */
export function SyncHone({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        HONE_STORAGE_KEY,
        honeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
