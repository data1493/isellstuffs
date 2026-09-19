"use client";

import { useEffect } from "react";

import { SCRIBE_STORAGE_KEY, scribeCookieValue } from "@/lib/listing-scribe";

/** Copy the cookie scribe set into `iss:scribe-listing-ids` after a no-JS POST. */
export function SyncScribe({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SCRIBE_STORAGE_KEY,
        scribeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
