"use client";

import { useEffect } from "react";

import { FERRITE_STORAGE_KEY, ferriteCookieValue } from "@/lib/listing-ferrite";

/** Copy the cookie ferrite set into `iss:ferrite-listing-ids` after a no-JS POST. */
export function SyncFerrite({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FERRITE_STORAGE_KEY,
        ferriteCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
