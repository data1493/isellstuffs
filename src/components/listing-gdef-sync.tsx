"use client";

import { useEffect } from "react";

import { GDEF_STORAGE_KEY, gdefCookieValue } from "@/lib/listing-gdef";

/** Copy the cookie gdef set into `iss:gdef-listing-ids` after a no-JS POST. */
export function SyncGdef({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GDEF_STORAGE_KEY,
        gdefCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
