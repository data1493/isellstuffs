"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  addListingToCart,
  isListingInCart,
  readCartListingIds,
  subscribeCart,
  type CartWriteResult,
} from "@/lib/cart";

const emptyCart: string[] = [];

export function useCart() {
  const listingIds = useSyncExternalStore(
    subscribeCart,
    readCartListingIds,
    () => emptyCart,
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
