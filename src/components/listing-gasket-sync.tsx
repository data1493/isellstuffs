"use client";

import { useEffect } from "react";

import { GASKET_STORAGE_KEY, gasketCookieValue } from "@/lib/listing-gasket";

/** Copy the cookie gasket set into `iss:gasket-listing-ids` after a no-JS POST. */
export function SyncGasket({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GASKET_STORAGE_KEY,
        gasketCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
