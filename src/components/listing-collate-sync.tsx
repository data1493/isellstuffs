"use client";

import { useEffect } from "react";

import {
  COLLATE_STORAGE_KEY,
  collateCookieValue,
} from "@/lib/listing-collate";

/** Copy the cookie collate set into `iss:collate-listing-ids` after a no-JS POST. */
export function SyncCollate({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        COLLATE_STORAGE_KEY,
        collateCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
