"use client";

import { useEffect } from "react";

import { CENTER_STORAGE_KEY, centerCookieValue } from "@/lib/listing-center";

/** Copy the cookie center set into `iss:center-listing-ids` after a no-JS POST. */
export function SyncCenter({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CENTER_STORAGE_KEY, centerCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
