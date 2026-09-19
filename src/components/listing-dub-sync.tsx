"use client";

import { useEffect } from "react";

import { DUB_STORAGE_KEY, dubCookieValue } from "@/lib/listing-dub";

/** Copy the cookie dub set into `iss:dub-listing-ids` after a no-JS POST. */
export function SyncDub({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DUB_STORAGE_KEY, dubCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
