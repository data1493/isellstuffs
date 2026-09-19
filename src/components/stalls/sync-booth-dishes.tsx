"use client";

import { useEffect } from "react";

import {
  BOOTH_DISHES_STORAGE_KEY,
  mergeBoothDishesMaps,
  readBoothDishes,
  serializeBoothDishes,
  type BoothDishesMap,
} from "@/lib/booth-dishes";

/** Copy the cookie cork into `iss:booth-dishes` after a no-JS tape. */
export function SyncBoothDishes({ map }: { map: BoothDishesMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothDishesMaps(readBoothDishes(), map);
      window.localStorage.setItem(
        BOOTH_DISHES_STORAGE_KEY,
        serializeBoothDishes(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
