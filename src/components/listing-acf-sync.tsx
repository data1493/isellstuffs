"use client";

import { useEffect } from "react";

import { ACF_STORAGE_KEY, acfCookieValue } from "@/lib/listing-acf";

/** Copy the cookie acf set into `iss:acf-listing-ids` after a no-JS POST. */
export function SyncAcf({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ACF_STORAGE_KEY,
        acfCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
