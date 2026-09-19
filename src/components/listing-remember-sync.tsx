"use client";

import { useEffect } from "react";

import {
  REMEMBER_STORAGE_KEY,
  rememberCookieValue,
} from "@/lib/listing-remember";

/** Copy the cookie remember set into `iss:remember-listing-ids` after a no-JS POST. */
export function SyncRemember({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        REMEMBER_STORAGE_KEY,
        rememberCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
