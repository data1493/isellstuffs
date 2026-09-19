"use client";

import { useEffect } from "react";

import { FIRM_STORAGE_KEY, firmCookieValue } from "@/lib/firm-price";

/** Copy the cookie firm set into `iss:firm-listing-ids` after a no-JS POST. */
export function SyncFirm({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(FIRM_STORAGE_KEY, firmCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
