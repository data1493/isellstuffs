"use client";

import { useEffect } from "react";

import {
  BLANCHARD_STORAGE_KEY,
  blanchardCookieValue,
} from "@/lib/listing-blanchard";

/** Copy the cookie blanchard set into `iss:blanchard-listing-ids` after a no-JS POST. */
export function SyncBlanchard({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BLANCHARD_STORAGE_KEY,
        blanchardCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
