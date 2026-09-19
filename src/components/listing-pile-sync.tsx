"use client";

import { useEffect } from "react";

import { PILE_STORAGE_KEY, pileCookieValue } from "@/lib/listing-pile";

/** Copy the cookie pile set into `iss:pile-listing-ids` after a no-JS POST. */
export function SyncPile({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PILE_STORAGE_KEY,
        pileCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
