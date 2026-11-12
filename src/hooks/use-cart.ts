"use client";

import { useCallback, useLayoutEffect, useState, useSyncExternalStore } from "react";

import {
  addListingToCart,
  isListingInCart,
  readCartListingIds,
  seedCartListingIds,
  subscribeCart,
  type CartWriteResult,
} from "@/lib/cart";

const emptyCart: string[] = [];

export function useCart(serverListingIds: readonly string[] = emptyCart) {
  const [serverSnapshot] = useState(() =>
    serverListingIds.length > 0 ? [...serverListingIds] : emptyCart,
  );

  const getServerSnapshot = useCallback(
    () => (serverSnapshot.length > 0 ? serverSnapshot : emptyCart),
    [serverSnapshot],
  );

  useLayoutEffect(() => {
    seedCartListingIds(serverSnapshot);
  }, [serverSnapshot]);

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
