"use client";

import { useEffect } from "react";

import { CHANNEL_STORAGE_KEY, channelCookieValue } from "@/lib/listing-channel";

/** Copy the cookie channel set into `iss:channel-listing-ids` after a no-JS POST. */
export function SyncChannel({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHANNEL_STORAGE_KEY,
        channelCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
