"use client";

import { useEffect } from "react";

import { GVAR_STORAGE_KEY, gvarCookieValue } from "@/lib/listing-gvar";

/** Copy the cookie gvar set into `iss:gvar-listing-ids` after a no-JS POST. */
export function SyncGvar({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GVAR_STORAGE_KEY,
        gvarCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
