"use client";

import { useEffect } from "react";

import { DASHPOT_STORAGE_KEY, dashpotCookieValue } from "@/lib/listing-dashpot";

/** Copy the cookie dashpot set into `iss:dashpot-listing-ids` after a no-JS POST. */
export function SyncDashpot({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DASHPOT_STORAGE_KEY,
        dashpotCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
