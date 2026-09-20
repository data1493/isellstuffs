"use client";

import { useEffect } from "react";

import { STAKE_STORAGE_KEY, stakeCookieValue } from "@/lib/listing-stake";

/** Copy the cookie stake set into `iss:stake-listing-ids` after a no-JS POST. */
export function SyncStake({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STAKE_STORAGE_KEY,
        stakeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
