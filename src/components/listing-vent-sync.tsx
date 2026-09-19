"use client";

import { useEffect } from "react";

import { VENT_STORAGE_KEY, ventCookieValue } from "@/lib/listing-vent";

/** Copy the cookie vent set into `iss:vent-listing-ids` after a no-JS POST. */
export function SyncVent({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(VENT_STORAGE_KEY, ventCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
