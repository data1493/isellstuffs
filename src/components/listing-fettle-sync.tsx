"use client";

import { useEffect } from "react";

import { FETTLE_STORAGE_KEY, fettleCookieValue } from "@/lib/listing-fettle";

/** Copy the cookie fettle set into `iss:fettle-listing-ids` after a no-JS POST. */
export function SyncFettle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FETTLE_STORAGE_KEY,
        fettleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
