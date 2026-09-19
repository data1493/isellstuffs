"use client";

import { useEffect } from "react";

import { HEAT_STORAGE_KEY, heatCookieValue } from "@/lib/listing-heat";

/** Copy the cookie microwave set into `iss:heat-listing-ids` after a no-JS POST. */
export function SyncHeat({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        HEAT_STORAGE_KEY,
        heatCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
