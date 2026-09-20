"use client";

import { useEffect } from "react";

import { KNOCKOUT_STORAGE_KEY, knockoutCookieValue } from "@/lib/listing-knockout";

/** Copy the cookie knockout set into `iss:knockout-listing-ids` after a no-JS POST. */
export function SyncKnockout({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        KNOCKOUT_STORAGE_KEY,
        knockoutCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
