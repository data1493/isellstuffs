"use client";

import { useEffect } from "react";

import { INSIDE_STORAGE_KEY, insideCookieValue } from "@/lib/listing-inside";

/** Copy the cookie inside set into `iss:inside-listing-ids` after a no-JS POST. */
export function SyncInside({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(INSIDE_STORAGE_KEY, insideCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
