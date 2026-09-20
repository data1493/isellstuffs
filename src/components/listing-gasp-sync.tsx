"use client";

import { useEffect } from "react";

import { GASP_STORAGE_KEY, gaspCookieValue } from "@/lib/listing-gasp";

/** Copy the cookie gasp set into `iss:gasp-listing-ids` after a no-JS POST. */
export function SyncGasp({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GASP_STORAGE_KEY,
        gaspCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
