"use client";

import { useEffect } from "react";

import { LTSH_STORAGE_KEY, ltshCookieValue } from "@/lib/listing-ltsh";

/** Copy the cookie ltsh set into `iss:ltsh-listing-ids` after a no-JS POST. */
export function SyncLtsh({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LTSH_STORAGE_KEY,
        ltshCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
