"use client";

import { useEffect } from "react";

import {
  FRINGE_STORAGE_KEY,
  fringeCookieValue,
} from "@/lib/listing-fringe";

/** Copy the cookie fringe set into `iss:fringe-listing-ids` after a no-JS POST. */
export function SyncFringe({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FRINGE_STORAGE_KEY,
        fringeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
