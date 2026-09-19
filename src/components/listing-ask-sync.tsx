"use client";

import { useEffect } from "react";

import { ASK_STORAGE_KEY, askCookieValue } from "@/lib/ask-first";

/** Copy the cookie ask set into `iss:ask-listing-ids` after a no-JS POST. */
export function SyncAsk({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(ASK_STORAGE_KEY, askCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
