"use client";

import { useEffect } from "react";

import { writeCartListingIds } from "@/lib/cart";

export function ClearCart({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) {
      return;
    }
    writeCartListingIds([]);
  }, [active]);

  return null;
}
