"use client";

import { useEffect } from "react";

import { TRAP_STORAGE_KEY, trapCookieValue } from "@/lib/listing-trap";

/** Copy the cookie trap set into `iss:trap-listing-ids` after a no-JS POST. */
export function SyncTrap({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(TRAP_STORAGE_KEY, trapCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
