"use client";

import { useEffect } from "react";

import {
  FIZEAU_STORAGE_KEY,
  fizeauCookieValue,
} from "@/lib/listing-fizeau";

/** Copy the cookie fizeau set into `iss:fizeau-listing-ids` after a no-JS POST. */
export function SyncFizeau({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FIZEAU_STORAGE_KEY,
        fizeauCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
