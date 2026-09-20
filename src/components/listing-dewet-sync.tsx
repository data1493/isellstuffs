"use client";

import { useEffect } from "react";

import { DEWET_STORAGE_KEY, dewetCookieValue } from "@/lib/listing-dewet";

/** Copy the cookie dewet set into `iss:dewet-listing-ids` after a no-JS POST. */
export function SyncDewet({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DEWET_STORAGE_KEY,
        dewetCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
