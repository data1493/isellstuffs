"use client";

import { useEffect } from "react";

import { GUM_STORAGE_KEY, gumCookieValue } from "@/lib/listing-gum";

/** Copy the cookie gum set into `iss:gum-listing-ids` after a no-JS POST. */
export function SyncGum({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(GUM_STORAGE_KEY, gumCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
