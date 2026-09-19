"use client";

import { useEffect } from "react";

import { QUANTIZE_STORAGE_KEY, quantizeCookieValue } from "@/lib/listing-quantize";

/** Copy the cookie quantize set into `iss:quantize-listing-ids` after a no-JS POST. */
export function SyncQuantize({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        QUANTIZE_STORAGE_KEY,
        quantizeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
