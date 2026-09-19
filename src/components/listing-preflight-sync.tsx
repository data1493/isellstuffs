"use client";

import { useEffect } from "react";

import {
  PREFLIGHT_STORAGE_KEY,
  preflightCookieValue,
} from "@/lib/listing-preflight";

/** Copy the cookie preflight set into `iss:preflight-listing-ids` after a no-JS POST. */
export function SyncPreflight({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PREFLIGHT_STORAGE_KEY,
        preflightCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
