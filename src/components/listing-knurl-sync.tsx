"use client";

import { useEffect } from "react";

import { KNURL_STORAGE_KEY, knurlCookieValue } from "@/lib/listing-knurl";

/** Copy the cookie knurl set into `iss:knurl-listing-ids` after a no-JS POST. */
export function SyncKnurl({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(KNURL_STORAGE_KEY, knurlCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
