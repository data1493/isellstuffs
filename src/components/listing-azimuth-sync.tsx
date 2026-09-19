"use client";

import { useEffect } from "react";

import { AZIMUTH_STORAGE_KEY, azimuthCookieValue } from "@/lib/listing-azimuth";

/** Copy the cookie azimuth set into `iss:azimuth-listing-ids` after a no-JS POST. */
export function SyncAzimuth({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        AZIMUTH_STORAGE_KEY,
        azimuthCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
