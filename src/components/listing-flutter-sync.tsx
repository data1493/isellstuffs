"use client";

import { useEffect } from "react";

import { FLUTTER_STORAGE_KEY, flutterCookieValue } from "@/lib/listing-flutter";

/** Copy the cookie flutter set into `iss:flutter-listing-ids` after a no-JS POST. */
export function SyncFlutter({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        FLUTTER_STORAGE_KEY,
        flutterCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
