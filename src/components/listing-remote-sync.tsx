"use client";

import { useEffect } from "react";

import { REMOTE_STORAGE_KEY, remoteCookieValue } from "@/lib/listing-remote";

/** Copy the cookie remote set into `iss:remote-listing-ids` after a no-JS POST. */
export function SyncRemote({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        REMOTE_STORAGE_KEY,
        remoteCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
