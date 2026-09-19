"use client";

import { useEffect } from "react";

import {
  WORKBOOK_STORAGE_KEY,
  workbookCookieValue,
} from "@/lib/listing-workbook";

/** Copy the cookie workbook set into `iss:workbook-listing-ids` after a no-JS POST. */
export function SyncWorkbook({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        WORKBOOK_STORAGE_KEY,
        workbookCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
