"use client";

import { useEffect } from "react";

import {
  VACUUM_STORAGE_KEY,
  vacuumCookieValue,
} from "@/lib/listing-vacuum";

/** Copy the cookie vacuum set into `iss:vacuum-listing-ids` after a no-JS POST. */
export function SyncVacuum({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        VACUUM_STORAGE_KEY,
        vacuumCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
