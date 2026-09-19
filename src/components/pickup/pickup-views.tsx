"use client";

import { useSyncExternalStore } from "react";

import { PickupCard } from "@/components/pickup/pickup-card";
import {
  PickupDigitalOnly,
  PickupEmpty,
} from "@/components/pickup/pickup-empty";
import type { CheckoutSessionSummary } from "@/lib/checkout";
import {
  readOrderSlips,
  subscribeOrderSlips,
  type OrderSlip,
} from "@/lib/order-history";
import { pickupHasPhysicalLines } from "@/lib/pickup-slip";

const emptyOrders: OrderSlip[] = [];

function pickupSource(
  slip: string,
  seed: CheckoutSessionSummary | null,
  orders: OrderSlip[],
): { id: string; listingIds: string[]; tender?: "cash" | "card" } | null {
  if (seed && seed.id === slip) {
    return seed;
  }
  const stored = orders.find((order) => order.id === slip);
  return stored ?? null;
}

/** Cookie slip first; `iss:orders` when the cookie is a different paid tote. */
export function PickupSlipView({
  slip,
  seed,
}: {
  slip: string;
  seed: CheckoutSessionSummary | null;
}) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );

  const source = pickupSource(slip, seed, stored);
  if (!source) {
    return <PickupEmpty />;
  }

  if (!pickupHasPhysicalLines(source.listingIds)) {
    return <PickupDigitalOnly slip={source.id} listingIds={source.listingIds} />;
  }

  return (
    <PickupCard
      slip={source.id}
      listingIds={source.listingIds}
      tender={source.tender}
    />
  );
}
