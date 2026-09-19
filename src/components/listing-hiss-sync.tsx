"use client";

import { useEffect } from "react";

import { HISS_STORAGE_KEY, hissCookieValue } from "@/lib/listing-hiss";

/** Copy the cookie hiss set into `iss:hiss-listing-ids` after a no-JS POST. */
export function SyncHiss({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        HISS_STORAGE_KEY,
        hissCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
