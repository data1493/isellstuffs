"use client";

import { useEffect } from "react";

import { CONVERT_STORAGE_KEY, convertCookieValue } from "@/lib/listing-convert";

/** Copy the cookie convert set into `iss:convert-listing-ids` after a no-JS POST. */
export function SyncConvert({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CONVERT_STORAGE_KEY,
        convertCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
