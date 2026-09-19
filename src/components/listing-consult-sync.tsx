"use client";

import { useEffect } from "react";

import { CONSULT_STORAGE_KEY, consultCookieValue } from "@/lib/listing-consult";

/** Copy the cookie consult set into `iss:consult-listing-ids` after a no-JS POST. */
export function SyncConsult({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CONSULT_STORAGE_KEY,
        consultCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
