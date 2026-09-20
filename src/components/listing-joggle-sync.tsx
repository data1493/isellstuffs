"use client";

import { useEffect } from "react";

import { JOGGLE_STORAGE_KEY, joggleCookieValue } from "@/lib/listing-joggle";

/** Copy the cookie joggle set into `iss:joggle-listing-ids` after a no-JS POST. */
export function SyncJoggle({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        JOGGLE_STORAGE_KEY,
        joggleCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
