"use client";

import { useEffect } from "react";

import { BLACKPAD_STORAGE_KEY, blackpadCookieValue } from "@/lib/listing-blackpad";

/** Copy the cookie blackpad set into `iss:blackpad-listing-ids` after a no-JS POST. */
export function SyncBlackpad({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BLACKPAD_STORAGE_KEY,
        blackpadCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
