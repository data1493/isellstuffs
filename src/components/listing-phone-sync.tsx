"use client";

import { useEffect } from "react";

import { PHONE_STORAGE_KEY, phoneCookieValue } from "@/lib/listing-phone";

/** Copy the cookie phone set into `iss:phone-listing-ids` after a no-JS POST. */
export function SyncPhone({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(PHONE_STORAGE_KEY, phoneCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
