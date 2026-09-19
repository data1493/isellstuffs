"use client";

import { useEffect } from "react";

import { RADIO_STORAGE_KEY, radioCookieValue } from "@/lib/listing-radio";

/** Copy the cookie radio set into `iss:radio-listing-ids` after a no-JS POST. */
export function SyncRadio({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RADIO_STORAGE_KEY,
        radioCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
