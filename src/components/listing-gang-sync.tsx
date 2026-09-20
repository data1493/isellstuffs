"use client";

import { useEffect } from "react";

import { GANG_STORAGE_KEY, gangCookieValue } from "@/lib/listing-gang";

/** Copy the cookie gang set into `iss:gang-listing-ids` after a no-JS POST. */
export function SyncGang({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GANG_STORAGE_KEY,
        gangCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
