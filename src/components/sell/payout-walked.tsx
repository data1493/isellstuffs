"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { MallNotice } from "@/components/mall-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";
import {
  formatPaidAt,
  readOrderSlips,
  subscribeOrderSlips,
  writeOrderSlip,
  type OrderSlip,
} from "@/lib/order-history";
import { listingPath, sellNewPath, stallPath } from "@/lib/paths";
import {
  groupWalkedByStall,
  mergeWalkedSlips,
  walkedLinesFromSlips,
  walkedMallTotals,
} from "@/lib/payout-walked";
import { feePercent } from "@/lib/seller-payouts";

const emptySlips: OrderSlip[] = [];

function kindLabel(listing: Listing) {
  if (isGiftListing(listing)) {
    return "Gift";
  }
  return isDigitalListing(listing) ? "Digital" : "Physical";
}

export function PayoutWalkedTape({ seed }: { seed: OrderSlip | null }) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptySlips,
  );

  useEffect(() => {
    if (seed) {
      writeOrderSlip(seed);
    }
  }, [seed]);

  const slips = mergeWalkedSlips(stored, seed);
  const lines = walkedLinesFromSlips(slips);
  const booths = groupWalkedByStall(lines);
  const totals = walkedMallTotals(booths);

  if (lines.length === 0) {
    return (
      <div className="mt-8">
        <MallNotice
          tone="empty"
          padded={false}
          titleAs="h2"
          eyebrow="Empty tape"
          title="Nothing walked in this browser."
          body="Pay a tote and the 10% prints here. Desk stickers without a slip stay off this paper."
          actions={
            <Button
              className="rounded-full px-5"
              render={<Link href={sellNewPath()} />}
            >
              List something
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Walked tags
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(totals.tag)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              {totals.listingCount}{" "}
              {totals.listingCount === 1 ? "line" : "lines"} paid in this
              browser.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Mall keeps
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(totals.mallCut)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              {feePercent}% taken from the stalls, not the buyer.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Stalls are owed
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(totals.stallOwed)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              The rest, still on paper.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <ul className="grid gap-4">
        {booths.map((booth) => (
          <li key={booth.stallId}>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  {booth.slug ? (
                    <Link
                      href={stallPath(booth.slug)}
                      className="underline-offset-4 hover:underline"
                    >
                      {booth.boothName}
                    </Link>
                  ) : (
                    booth.boothName
                  )}
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  {booth.lines.length}{" "}
                  {booth.lines.length === 1 ? "line" : "lines"} walked. Mall
                  keeps {formatMoney(booth.mallCut)}. Stall is owed{" "}
                  {formatMoney(booth.stallOwed)}.
                </CardDescription>
              </CardHeader>
              <ul className="grid gap-3 px-4 pb-4">
                {booth.lines.map((line) => (
                  <li
                    key={`${line.slipId}:${line.listingId}`}
                    className="rounded-xl border border-border bg-background/70 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="w-fit">
                        {line.listing ? kindLabel(line.listing) : "Gone"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatPaidAt(line.paidAt)}
                      </p>
                    </div>
                    <p className="mt-2 font-heading text-xl leading-7">
                      {line.listing ? (
                        <Link
                          href={listingPath(line.listing.id)}
                          className="underline-offset-4 hover:underline"
                        >
                          {line.listing.title}
                        </Link>
                      ) : (
                        line.listingId
                      )}
                    </p>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          On the tag
                        </dt>
                        <dd className="font-heading text-lg sm:mt-1">
                          {formatMoney(line.tag)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Mall keeps
                        </dt>
                        <dd className="font-heading text-lg sm:mt-1">
                          {formatMoney(line.mallCut)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Stall is owed
                        </dt>
                        <dd className="font-heading text-lg sm:mt-1">
                          {formatMoney(line.stallOwed)}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border px-4 py-3 font-mono text-xs text-muted-foreground">
                {booth.mockDestination}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
