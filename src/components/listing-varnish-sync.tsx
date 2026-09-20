"use client";

import { useEffect } from "react";

import { VARNISH_STORAGE_KEY, varnishCookieValue } from "@/lib/listing-varnish";

/** Copy the cookie varnish set into `iss:varnish-listing-ids` after a no-JS POST. */
export function SyncVarnish({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        VARNISH_STORAGE_KEY,
        varnishCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
