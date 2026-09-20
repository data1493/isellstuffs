"use client";

import { useEffect } from "react";

import { SHIELD_STORAGE_KEY, shieldCookieValue } from "@/lib/listing-shield";

/** Copy the cookie shield set into `iss:shield-listing-ids` after a no-JS POST. */
export function SyncShield({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SHIELD_STORAGE_KEY,
        shieldCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
