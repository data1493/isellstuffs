"use client";

import { useEffect } from "react";

import { TEMPER_STORAGE_KEY, temperCookieValue } from "@/lib/listing-temper";

/** Copy the cookie temper set into `iss:temper-listing-ids` after a no-JS POST. */
export function SyncTemper({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        TEMPER_STORAGE_KEY,
        temperCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
