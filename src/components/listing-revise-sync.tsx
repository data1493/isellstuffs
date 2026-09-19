"use client";

import { useEffect } from "react";

import { REVISE_STORAGE_KEY, reviseCookieValue } from "@/lib/listing-revise";

/** Copy the cookie revise set into `iss:revise-listing-ids` after a no-JS POST. */
export function SyncRevise({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        REVISE_STORAGE_KEY,
        reviseCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
