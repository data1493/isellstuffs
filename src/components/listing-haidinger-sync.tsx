"use client";

import { useEffect } from "react";

import {
  HAIDINGER_STORAGE_KEY,
  haidingerCookieValue,
} from "@/lib/listing-haidinger";

/** Copy the cookie haidinger set into `iss:haidinger-listing-ids` after a no-JS POST. */
export function SyncHaidinger({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        HAIDINGER_STORAGE_KEY,
        haidingerCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
