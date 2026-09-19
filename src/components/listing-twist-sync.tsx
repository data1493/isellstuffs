"use client";

import { useEffect } from "react";

import { TWIST_STORAGE_KEY, twistCookieValue } from "@/lib/listing-twist";

/** Copy the cookie twist set into `iss:twist-listing-ids` after a no-JS POST. */
export function SyncTwist({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(TWIST_STORAGE_KEY, twistCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
