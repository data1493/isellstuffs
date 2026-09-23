"use client";

import { useEffect } from "react";

import type { CheckoutSessionSummary } from "@/lib/checkout";
import { orderSlipFromSession, writeOrderSlip } from "@/lib/order-history";

export function RememberOrder({
  session,
}: {
  session: CheckoutSessionSummary | null;
}) {
  useEffect(() => {
    if (!session || session.listingIds.length === 0) {
      return;
    }
    writeOrderSlip(orderSlipFromSession(session));
  }, [session]);

  return null;
}
