"use client";

import { useEffect } from "react";

import {
  RETIP_STORAGE_KEY,
  retipCookieValue,
} from "@/lib/listing-retip";

/** Copy the cookie retip set into `iss:retip-listing-ids` after a no-JS POST. */
export function SyncRetip({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RETIP_STORAGE_KEY,
        retipCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
