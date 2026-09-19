"use client";

import { useEffect } from "react";

import { BALANCE_STORAGE_KEY, balanceCookieValue } from "@/lib/listing-balance";

/** Copy the cookie balance set into `iss:balance-listing-ids` after a no-JS POST. */
export function SyncBalance({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(BALANCE_STORAGE_KEY, balanceCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
