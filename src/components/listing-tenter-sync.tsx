"use client";

import { useEffect } from "react";

import {
  TENTER_STORAGE_KEY,
  tenterCookieValue,
} from "@/lib/listing-tenter";

/** Copy the cookie tenter set into `iss:tenter-listing-ids` after a no-JS POST. */
export function SyncTenter({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TENTER_STORAGE_KEY,
        tenterCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
