"use client";

import { useEffect } from "react";

import { SOCKET_STORAGE_KEY, socketCookieValue } from "@/lib/listing-socket";

/** Copy the cookie socket set into `iss:socket-listing-ids` after a no-JS POST. */
export function SyncSocket({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SOCKET_STORAGE_KEY, socketCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
