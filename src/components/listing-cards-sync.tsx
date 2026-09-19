"use client";

import { useEffect } from "react";

import { CARDS_STORAGE_KEY, cardsCookieValue } from "@/lib/listing-cards";

/** Copy the cookie cards set into `iss:cards-listing-ids` after a no-JS POST. */
export function SyncCards({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CARDS_STORAGE_KEY,
        cardsCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
