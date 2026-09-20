"use client";

import { useEffect } from "react";

import { JIGGER_STORAGE_KEY, jiggerCookieValue } from "@/lib/listing-jigger";

/** Copy the cookie jigger set into `iss:jigger-listing-ids` after a no-JS POST. */
export function SyncJigger({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        JIGGER_STORAGE_KEY,
        jiggerCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
