"use client";

import { useEffect } from "react";

import { HINGE_STORAGE_KEY, hingeCookieValue } from "@/lib/listing-hinge";

/** Copy the cookie hinge set into `iss:hinge-listing-ids` after a no-JS POST. */
export function SyncHinge({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(HINGE_STORAGE_KEY, hingeCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
