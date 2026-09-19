"use client";

import { useEffect } from "react";

import {
  REFLOW_STORAGE_KEY,
  reflowCookieValue,
} from "@/lib/listing-reflow";

/** Copy the cookie reflow set into `iss:reflow-listing-ids` after a no-JS POST. */
export function SyncReflow({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        REFLOW_STORAGE_KEY,
        reflowCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
