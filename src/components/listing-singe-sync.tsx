"use client";

import { useEffect } from "react";

import { SINGE_STORAGE_KEY, singeCookieValue } from "@/lib/listing-singe";

/** Copy the cookie singe set into `iss:singe-listing-ids` after a no-JS POST. */
export function SyncSinge({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SINGE_STORAGE_KEY,
        singeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
