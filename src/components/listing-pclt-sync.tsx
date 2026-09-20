"use client";

import { useEffect } from "react";

import { PCLT_STORAGE_KEY, pcltCookieValue } from "@/lib/listing-pclt";

/** Copy the cookie pclt set into `iss:pclt-listing-ids` after a no-JS POST. */
export function SyncPclt({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PCLT_STORAGE_KEY,
        pcltCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
