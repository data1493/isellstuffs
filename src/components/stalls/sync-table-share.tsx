"use client";

import { useEffect } from "react";

import {
  TABLE_SHARE_STORAGE_KEY,
  mergeTableShareMaps,
  readTableShare,
  serializeTableShare,
  type TableShareMap,
} from "@/lib/table-share";

/** Copy the cookie cork into `iss:table-share` after a no-JS tape. */
export function SyncTableShare({ map }: { map: TableShareMap }) {
  useEffect(() => {
    try {
      const next = mergeTableShareMaps(readTableShare(), map);
      window.localStorage.setItem(
        TABLE_SHARE_STORAGE_KEY,
        serializeTableShare(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
