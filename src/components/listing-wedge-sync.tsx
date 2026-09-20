"use client";

import { useEffect } from "react";

import {
  WEDGE_STORAGE_KEY,
  wedgeCookieValue,
} from "@/lib/listing-wedge";

/** Copy the cookie wedge set into `iss:wedge-listing-ids` after a no-JS POST. */
export function SyncWedge({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        WEDGE_STORAGE_KEY,
        wedgeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
