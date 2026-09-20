"use client";

import { useEffect } from "react";

import { EBDT_STORAGE_KEY, ebdtCookieValue } from "@/lib/listing-ebdt";

/** Copy the cookie ebdt set into `iss:ebdt-listing-ids` after a no-JS POST. */
export function SyncEbdt({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        EBDT_STORAGE_KEY,
        ebdtCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
