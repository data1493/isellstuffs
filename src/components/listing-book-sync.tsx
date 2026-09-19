"use client";

import { useEffect } from "react";

import { BOOK_STORAGE_KEY, bookCookieValue } from "@/lib/listing-book";

/** Copy the cookie booklet set into `iss:book-listing-ids` after a no-JS POST. */
export function SyncBook({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BOOK_STORAGE_KEY,
        bookCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
