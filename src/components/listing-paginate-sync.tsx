"use client";

import { useEffect } from "react";

import {
  PAGINATE_STORAGE_KEY,
  paginateCookieValue,
} from "@/lib/listing-paginate";

/** Copy the cookie paginate set into `iss:paginate-listing-ids` after a no-JS POST. */
export function SyncPaginate({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PAGINATE_STORAGE_KEY,
        paginateCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
