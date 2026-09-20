"use client";

import { useEffect } from "react";

import { ECCENTRIC_STORAGE_KEY, eccentricCookieValue } from "@/lib/listing-eccentric";

/** Copy the cookie eccentric set into `iss:eccentric-listing-ids` after a no-JS POST. */
export function SyncEccentric({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ECCENTRIC_STORAGE_KEY,
        eccentricCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
