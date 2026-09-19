"use client";

import { useEffect } from "react";

import { BEEP_STORAGE_KEY, beepCookieValue } from "@/lib/listing-beep";

/** Copy the cookie beep set into `iss:beep-listing-ids` after a no-JS POST. */
export function SyncBeep({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(BEEP_STORAGE_KEY, beepCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
