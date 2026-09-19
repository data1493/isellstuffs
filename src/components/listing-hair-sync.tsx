"use client";

import { useEffect } from "react";

import { HAIR_STORAGE_KEY, hairCookieValue } from "@/lib/listing-hair";

/** Copy the cookie hair set into `iss:hair-listing-ids` after a no-JS POST. */
export function SyncHair({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(HAIR_STORAGE_KEY, hairCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
