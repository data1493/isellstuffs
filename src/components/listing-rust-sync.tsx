"use client";

import { useEffect } from "react";

import { RUST_STORAGE_KEY, rustCookieValue } from "@/lib/listing-rust";

/** Copy the cookie rust set into `iss:rust-listing-ids` after a no-JS POST. */
export function SyncRust({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(RUST_STORAGE_KEY, rustCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
