"use client";

import { useEffect } from "react";

import {
  BOOTH_SPIDER_STORAGE_KEY,
  mergeBoothSpiderMaps,
  readBoothSpider,
  serializeBoothSpider,
  type BoothSpiderMap,
} from "@/lib/booth-spider";

/** Copy the cookie cork into `iss:booth-spider` after a no-JS tape. */
export function SyncBoothSpider({ map }: { map: BoothSpiderMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSpiderMaps(readBoothSpider(), map);
      window.localStorage.setItem(
        BOOTH_SPIDER_STORAGE_KEY,
        serializeBoothSpider(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
