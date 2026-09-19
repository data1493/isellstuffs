"use client";

import { useEffect } from "react";

import { VERSO_STORAGE_KEY, versoCookieValue } from "@/lib/listing-verso";

/** Copy the cookie verso set into `iss:verso-listing-ids` after a no-JS POST. */
export function SyncVerso({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        VERSO_STORAGE_KEY,
        versoCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
