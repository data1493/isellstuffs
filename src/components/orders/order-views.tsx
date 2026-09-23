"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { OrderMissing, OrdersEmpty } from "@/components/orders/order-empty";
import { OrderSlipCard } from "@/components/orders/order-slip";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPlanMoney } from "@/lib/checkout";
import {
  formatPaidAt,
  orderTitleMix,
  readOrderSlips,
  subscribeOrderSlips,
  writeOrderSlip,
  type OrderSlip,
} from "@/lib/order-history";
import { orderPath } from "@/lib/paths";

const emptyOrders: OrderSlip[] = [];

function mergeSeed(orders: OrderSlip[], seed: OrderSlip | null) {
  if (!seed) {
    return orders;
  }
  if (orders.some((order) => order.id === seed.id)) {
    return orders;
  }
  return [seed, ...orders];
}

export function OrderSlipView({
  orderId,
  seed,
}: {
  orderId: string;
  seed: OrderSlip | null;
}) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );

  useEffect(() => {
    if (seed) {
      writeOrderSlip(seed);
    }
  }, [seed]);

  const orders = mergeSeed(stored, seed);
  const order =
    orders.find((item) => item.id === orderId) ??
    (seed?.id === orderId ? seed : null);

  if (!order) {
    return <OrderMissing />;
  }

  return <OrderSlipCard order={order} />;
}

export function OrderIndexView({ seed }: { seed: OrderSlip | null }) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );

  useEffect(() => {
    if (seed) {
      writeOrderSlip(seed);
    }
  }, [seed]);

  const orders = mergeSeed(stored, seed);

  if (orders.length === 0) {
    return <OrdersEmpty />;
  }

  return (
    <div>
      <MallHero>
        <MallCrumb label="Orders">
          <CrumbSep />
          <span className="text-foreground">Orders</span>
        </MallCrumb>

        <Badge variant="secondary" className="w-fit rounded-full">
          This browser only
        </Badge>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Paid totes</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            The last slips on the desk.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Stand-in receipts from checkout. Each slip reconstructs what was in
            the tote from the listing ids. No account. No database.
          </p>
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-3">
        {orders.map((order) => (
          <Link key={order.id} href={orderPath(order.id)} className="block">
            <Card className="bg-card transition-colors hover:bg-secondary/30">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-balance">
                  {orderTitleMix(order.listingIds)}
                </CardTitle>
                <CardDescription className="leading-6">
                  {formatPaidAt(order.paidAt)} ·{" "}
                  {formatPlanMoney(order.subtotalCents, order.currency)} ·{" "}
                  {order.listingIds.length}{" "}
                  {order.listingIds.length === 1 ? "line" : "lines"}
                  <span className="mt-1 block font-mono text-xs">
                    {order.id}
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </MallSection>
    </div>
  );
}
