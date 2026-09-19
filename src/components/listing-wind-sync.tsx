"use client";

import { useEffect } from "react";

import { WIND_STORAGE_KEY, windCookieValue } from "@/lib/listing-wind";

/** Copy the cookie wind set into `iss:wind-listing-ids` after a no-JS POST. */
export function SyncWind({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(WIND_STORAGE_KEY, windCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
