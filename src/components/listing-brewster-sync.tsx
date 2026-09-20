"use client";

import { useEffect } from "react";

import {
  BREWSTER_STORAGE_KEY,
  brewsterCookieValue,
} from "@/lib/listing-brewster";

/** Copy the cookie brewster set into `iss:brewster-listing-ids` after a no-JS POST. */
export function SyncBrewster({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BREWSTER_STORAGE_KEY,
        brewsterCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
