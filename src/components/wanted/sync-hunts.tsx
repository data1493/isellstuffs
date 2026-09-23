"use client";

import { useEffect } from "react";

import {
  mergeWantedHunts,
  readWantedHunts,
  serializeWantedHunts,
  WANTED_STORAGE_KEY,
  type Hunt,
} from "@/lib/wanted";

/** Copy the cookie cork into `iss:wanted-hunts` after a no-JS tape. */
export function SyncHunts({ hunts }: { hunts: Hunt[] }) {
  useEffect(() => {
    try {
      const next = mergeWantedHunts(readWantedHunts(), hunts);
      window.localStorage.setItem(WANTED_STORAGE_KEY, serializeWantedHunts(next));
    } catch {
      // blocked storage
    }
  }, [hunts]);

  return null;
}
