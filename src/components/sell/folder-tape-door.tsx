"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  readOrderSlips,
  subscribeOrderSlips,
  type OrderSlip,
} from "@/lib/order-history";
import { sellFoldersPath } from "@/lib/paths";
import {
  boothHasFolderTape,
  mergeFolderTapeSlips,
} from "@/lib/seller-folders";

const emptyOrders: OrderSlip[] = [];

export function FolderTapeDoor({
  stallId,
  seed = null,
}: {
  stallId: string;
  seed?: OrderSlip | null;
}) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );
  const orders = mergeFolderTapeSlips(stored, seed);

  if (!boothHasFolderTape(orders, stallId)) {
    return null;
  }

  return (
    <p
      data-folder-tape-door={stallId}
      className="max-w-2xl text-sm leading-6 text-muted-foreground"
    >
      A file from this booth walked into a folder.{" "}
      <Link
        href={sellFoldersPath()}
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        Open the folder tape
      </Link>
      .
    </p>
  );
}
