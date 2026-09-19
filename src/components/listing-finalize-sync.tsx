"use client";

import { useEffect } from "react";

import {
  FINALIZE_STORAGE_KEY,
  finalizeCookieValue,
} from "@/lib/listing-finalize";

/** Copy the cookie finalize set into `iss:finalize-listing-ids` after a no-JS POST. */
export function SyncFinalize({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FINALIZE_STORAGE_KEY,
        finalizeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
