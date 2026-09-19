"use client";

import { useEffect } from "react";

import { RECAP_STORAGE_KEY, recapCookieValue } from "@/lib/listing-recap";

/** Copy the cookie recap set into `iss:recap-listing-ids` after a no-JS POST. */
export function SyncRecap({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(RECAP_STORAGE_KEY, recapCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
