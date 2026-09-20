"use client";

import { useEffect } from "react";

import {
  FROST_STORAGE_KEY,
  frostCookieValue,
} from "@/lib/listing-frost";

/** Copy the cookie frost set into `iss:frost-listing-ids` after a no-JS POST. */
export function SyncFrost({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FROST_STORAGE_KEY,
        frostCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
