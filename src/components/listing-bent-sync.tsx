"use client";

import { useEffect } from "react";

import { BENT_STORAGE_KEY, bentCookieValue } from "@/lib/listing-bent";

/** Copy the cookie bent set into `iss:bent-listing-ids` after a no-JS POST. */
export function SyncBent({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BENT_STORAGE_KEY,
        bentCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
