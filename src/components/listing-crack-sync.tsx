"use client";

import { useEffect } from "react";

import { CRACK_STORAGE_KEY, crackCookieValue } from "@/lib/listing-crack";

/** Copy the cookie crack set into `iss:crack-listing-ids` after a no-JS POST. */
export function SyncCrack({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CRACK_STORAGE_KEY, crackCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
