"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { OrderMissing } from "@/components/orders/order-empty";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPlanMoney } from "@/lib/checkout";
import { isGiftListing, isPhysicalListing } from "@/lib/commerce";
import { listingFact, listingTypeLabel } from "@/lib/listing-display";
import {
  orderTitleMix,
  reconstructOrderGroups,
  readOrderSlips,
  subscribeOrderSlips,
  writeOrderSlip,
  type OrderLine,
  type OrderSlip,
} from "@/lib/order-history";
import { orderPath, ordersPath } from "@/lib/paths";
import { site } from "@/lib/site";

const emptyOrders: OrderSlip[] = [];

function clientTrue() {
  return true;
}

function serverFalse() {
  return false;
}

function subscribeNothing() {
  return () => {};
}

function mergeSeed(orders: OrderSlip[], seed: OrderSlip | null) {
  if (!seed) {
    return orders;
  }
  if (orders.some((order) => order.id === seed.id)) {
    return orders;
  }
  return [seed, ...orders];
}

function lineNote(line: OrderLine) {
  if (!line.listing) {
    return `Left the catalog · ${line.listingId}`;
  }
  const fact = listingFact(line.listing);
  if (isPhysicalListing(line.listing)) {
    return `Pick up · ${fact}`;
  }
  if (isGiftListing(line.listing)) {
    return `Mall credit · ${fact}`;
  }
  return `Download stand-in · ${fact}`;
}

function formatEmailDate(paidAt: number) {
  const when = paidAt > 0 ? new Date(paidAt) : new Date();
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(when);
  } catch {
    return "Just paid";
  }
}

function emailSubject(order: OrderSlip) {
  const mix = orderTitleMix(order.listingIds);
  if (mix === "Empty tote") {
    return `Your tote from ${site.name}`;
  }
  return `Your tote · ${mix}`;
}

function OrderEmailPaper({ order }: { order: OrderSlip }) {
  const groups = reconstructOrderGroups(order.listingIds);
  const to = order.buyerEmail ?? "the buyer on this tab";
  const greeting = order.buyerName ? `Hi ${order.buyerName},` : "Hi,";
  const subject = emailSubject(order);

  return (
    <article
      aria-label="Printed receipt email"
      className="overflow-hidden rounded-sm bg-[oklch(0.995_0.004_85)] text-foreground shadow-[0_1px_0_oklch(0.82_0.03_75),0_18px_40px_-24px_oklch(0.3_0.04_45)] ring-1 ring-[oklch(0.82_0.03_75)]"
    >
      <header className="space-y-2 border-b border-dashed border-[oklch(0.82_0.03_75)] bg-[oklch(0.975_0.012_85)] px-5 py-5 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Inbox · stand-in
        </p>
        <dl className="grid gap-2 text-sm">
          <div className="grid gap-0.5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              From
            </dt>
            <dd>
              the desk at {site.name}{" "}
              <span className="text-muted-foreground">&lt;receipts@isellstuffs.com&gt;</span>
            </dd>
          </div>
          <div className="grid gap-0.5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              To
            </dt>
            <dd>{to}</dd>
          </div>
          <div className="grid gap-0.5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Subject
            </dt>
            <dd className="font-medium text-pretty">{subject}</dd>
          </div>
          <div className="grid gap-0.5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Date
            </dt>
            <dd>{formatEmailDate(order.paidAt)}</dd>
          </div>
        </dl>
      </header>

      <div className="space-y-6 px-5 py-7 sm:px-8 sm:py-9">
        <p className="text-base leading-7">{greeting}</p>
        <p className="text-sm leading-7 text-muted-foreground">
          This is the receipt email the mall would have sent if it sent mail. It
          did not. The lines are the same listing ids as the slip on the desk.
          Nothing live moved.
        </p>

        <div className="space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            What was in the tote
          </p>
          {groups.map((group) => (
            <div key={group.stallId} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {group.boothName}
              </p>
              <ul className="space-y-3">
                {group.lines.map((line) => (
                  <li
                    key={line.listingId}
                    data-listing-id={line.listingId}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span>
                      <span className="block font-medium">
                        {line.listing ? line.listing.title : "Unknown listing"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {line.listing
                          ? `${listingTypeLabel(line.listing)} · ${lineNote(line)}`
                          : lineNote(line)}
                      </span>
                    </span>
                    <span className="shrink-0 font-heading">
                      {line.listing
                        ? formatPlanMoney(
                            line.listing.price.amountCents,
                            line.listing.price.currency,
                          )
                        : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-heading text-xl">
              {formatPlanMoney(order.subtotalCents, order.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mall kept</span>
            <span>
              {formatPlanMoney(order.platformFeeCents, order.currency)}
            </span>
          </div>
        </div>

        <p className="text-sm leading-7 text-muted-foreground">
          Physical finds stay with the stall. Digital lines get a folder
          stand-in. Gift credit is a desk listing, not a payment-provider gift.
          The mall does not keep a warehouse invoice.
        </p>

        <p className="border-t border-dashed border-[oklch(0.82_0.03_75)] pt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Mock only · nothing was sent · slip {order.id}
        </p>
      </div>
    </article>
  );
}

export function OrderEmailCard({ order }: { order: OrderSlip }) {
  return (
    <div>
      <MallHero className="print:hidden">
        <MallCrumb label="Printed email">
          <CrumbSep />
          <Link
            href={ordersPath()}
            className="hover:text-foreground hover:underline"
          >
            Orders
          </Link>
          <CrumbSep />
          <Link
            href={orderPath(order.id)}
            className="hover:text-foreground hover:underline"
          >
            Slip
          </Link>
          <CrumbSep />
          <span className="text-foreground">Email</span>
        </MallCrumb>

        <Badge variant="outline" className="w-fit rounded-full">
          Printed view · not sent
        </Badge>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Receipt email mock</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            What would have landed in the inbox.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            A paper copy of the stand-in receipt. Same tote lines as the slip.
            The mall does not send mail.
          </p>
        </div>
      </MallHero>

      <MallSection innerClassName="grid max-w-2xl gap-6">
        <OrderEmailPaper order={order} />

        <div className="flex flex-col gap-3 print:hidden">
          <Button
            className="w-full rounded-full sm:w-auto"
            render={<Link href={orderPath(order.id)} />}
          >
            Back to the slip
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={ordersPath()} />}
          >
            All slips
          </Button>
        </div>
      </MallSection>
    </div>
  );
}

export function OrderEmailView({
  orderId,
  seed,
}: {
  orderId: string;
  seed: OrderSlip | null;
}) {
  const mounted = useSyncExternalStore(
    subscribeNothing,
    clientTrue,
    serverFalse,
  );
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

  if (!mounted && !order) {
    return (
      <p className="px-4 py-16 text-sm text-muted-foreground sm:px-6">
        Pulling the printed email…
      </p>
    );
  }

  if (!order) {
    return <OrderMissing />;
  }

  return <OrderEmailCard order={order} />;
}
