"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

import {
  addListingToCart,
  isListingInCart,
  readCartListingIds,
  subscribeCart,
  type CartWriteResult,
} from "@/lib/cart";

const emptyCart: string[] = [];

export function useCart(serverListingIds: readonly string[] = emptyCart) {
  const serverSnapshot = useRef(
    serverListingIds.length > 0 ? [...serverListingIds] : emptyCart,
  ).current;

  const getServerSnapshot = useCallback(
    () => (serverSnapshot.length > 0 ? serverSnapshot : emptyCart),
    [serverSnapshot],
  );

  const listingIds = useSyncExternalStore(
    subscribeCart,
    readCartListingIds,
    getServerSnapshot,
  );

  const add = useCallback((listingId: string): CartWriteResult => {
    return addListingToCart(listingId);
  }, []);

  return {
    listingIds,
    count: listingIds.length,
    has: (listingId: string) => isListingInCart(listingId, listingIds),
    add,
  };
}
