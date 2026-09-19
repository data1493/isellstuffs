"use client";

import { useEffect } from "react";

import {
  BREAK_BILLS_STORAGE_KEY,
  mergeBreakBillsMaps,
  readBreakBills,
  serializeBreakBills,
  type BreakBillsMap,
} from "@/lib/break-bills";

/** Copy the cookie cork into `iss:break-bills` after a no-JS tape. */
export function SyncBreakBills({ map }: { map: BreakBillsMap }) {
  useEffect(() => {
    try {
      const next = mergeBreakBillsMaps(readBreakBills(), map);
      window.localStorage.setItem(
        BREAK_BILLS_STORAGE_KEY,
        serializeBreakBills(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
