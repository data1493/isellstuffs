"use client";

import { useSyncExternalStore } from "react";

import { FolderEmpty } from "@/components/folder/folder-empty";
import { FolderSlip } from "@/components/folder/folder-slip";
import type { CheckoutSessionSummary } from "@/lib/checkout";
import {
  digitalLinesOnSlip,
  resolveFolderIndex,
  resolveFolderSlip,
  type FolderSlipRef,
} from "@/lib/digital-folder";
import {
  readOrderSlips,
  subscribeOrderSlips,
  type OrderSlip,
} from "@/lib/order-history";

const emptyOrders: OrderSlip[] = [];

function FolderFromSource({ source }: { source: FolderSlipRef | null }) {
  if (!source) {
    return <FolderEmpty />;
  }

  const lines = digitalLinesOnSlip(source.listingIds);
  if (lines.length === 0) {
    return <FolderEmpty />;
  }

  return <FolderSlip slip={source.id} lines={lines} />;
}

/** Cookie slip first; `iss:orders` when the cookie is a different paid tote. */
export function FolderSlipView({
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

  return (
    <FolderFromSource source={resolveFolderSlip(slip, seed, stored)} />
  );
}

/** Current cookie, or the newest order that still has files. */
export function FolderIndexView({
  seed,
}: {
  seed: CheckoutSessionSummary | null;
}) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );

  return <FolderFromSource source={resolveFolderIndex(seed, stored)} />;
}
