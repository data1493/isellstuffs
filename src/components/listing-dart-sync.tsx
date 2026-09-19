"use client";

import { useEffect } from "react";

import { DART_STORAGE_KEY, dartCookieValue } from "@/lib/listing-dart";

/** Copy the cookie dart set into `iss:dart-listing-ids` after a no-JS POST. */
export function SyncDart({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DART_STORAGE_KEY, dartCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
