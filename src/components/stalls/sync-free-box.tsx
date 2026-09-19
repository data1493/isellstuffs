"use client";

import { useEffect } from "react";

import {
  FREE_BOX_STORAGE_KEY,
  mergeFreeBox,
  readFreeBox,
  serializeFreeBox,
  type FreeTitle,
} from "@/lib/free-box";

/** Copy the cookie pile into `iss:free-box` after a no-JS tape. */
export function SyncFreeBox({ titles }: { titles: FreeTitle[] }) {
  useEffect(() => {
    try {
      const next = mergeFreeBox(readFreeBox(), titles);
      window.localStorage.setItem(FREE_BOX_STORAGE_KEY, serializeFreeBox(next));
    } catch {
      // blocked storage
    }
  }, [titles]);

  return null;
}
