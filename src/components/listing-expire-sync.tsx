"use client";

import { useEffect } from "react";

import { EXPIRE_STORAGE_KEY, expireCookieValue } from "@/lib/listing-expire";

/** Copy the cookie expire set into `iss:expire-listing-ids` after a no-JS POST. */
export function SyncExpire({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        EXPIRE_STORAGE_KEY,
        expireCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
