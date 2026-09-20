"use client";

import { useEffect } from "react";

import {
  ANTISKATE_STORAGE_KEY,
  antiskateCookieValue,
} from "@/lib/listing-antiskate";

/** Copy the cookie antiskate set into `iss:antiskate-listing-ids` after a no-JS POST. */
export function SyncAntiskate({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ANTISKATE_STORAGE_KEY,
        antiskateCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
