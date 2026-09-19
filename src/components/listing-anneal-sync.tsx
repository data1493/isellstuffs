"use client";

import { useEffect } from "react";

import { ANNEAL_STORAGE_KEY, annealCookieValue } from "@/lib/listing-anneal";

/** Copy the cookie anneal set into `iss:anneal-listing-ids` after a no-JS POST. */
export function SyncAnneal({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ANNEAL_STORAGE_KEY,
        annealCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
