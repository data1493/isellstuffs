"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { TakenButton } from "@/components/sell/taken-button";
import { TakenEmpty, TakenNotPhysical } from "@/components/sell/taken-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { folderHasDigitalLines } from "@/lib/digital-folder";
import {
  readOrderSlips,
  subscribeOrderSlips,
  writeOrderSlip,
  type OrderSlip,
} from "@/lib/order-history";
import {
  listingPath,
  pickupSlipPath,
  sellDeskPath,
  sellDeskQueuePath,
  sellPath,
  sellTakenPath,
  stallPath,
} from "@/lib/paths";
import {
  queueBoothsFromSlips,
  queueHasPhysicalLines,
} from "@/lib/seller-queue";
import {
  isHandoffTaken,
  queueBoothsStillComing,
  readTakenHandoffs,
  subscribeTaken,
  TAKEN_MIRROR_SCRIPT,
  type TakenHandoff,
} from "@/lib/taken-handoff";

const emptyOrders: OrderSlip[] = [];
const emptyTaken: TakenHandoff[] = [];

function mergeSeed(orders: OrderSlip[], seed: OrderSlip | null) {
  if (!seed) {
    return orders;
  }
  if (orders.some((order) => order.id === seed.id)) {
    return orders;
  }
  return [seed, ...orders];
}

function whoIsComing(arrival: { buyerName?: string; slipId: string }) {
  const name = arrival.buyerName?.trim();
  return name && name.length > 0 ? name : arrival.slipId;
}

export function TakenView({
  seed,
  takenSeed = emptyTaken,
}: {
  seed: OrderSlip | null;
  takenSeed?: TakenHandoff[];
}) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );
  const taken = useSyncExternalStore(
    subscribeTaken,
    readTakenHandoffs,
    () => takenSeed,
  );

  useEffect(() => {
    if (seed) {
      writeOrderSlip(seed);
    }
  }, [seed]);

  const orders = mergeSeed(stored, seed);

  if (orders.length === 0) {
    return <TakenEmpty />;
  }

  if (!queueHasPhysicalLines(orders)) {
    const digital = orders.find((order) =>
      folderHasDigitalLines(order.listingIds),
    );
    return (
      <TakenNotPhysical
        listingIds={digital?.listingIds ?? orders[0].listingIds}
        slip={digital?.id ?? orders[0].id}
      />
    );
  }

  const allBooths = queueBoothsFromSlips(orders);
  const coming = queueBoothsStillComing(allBooths, taken);
  const left = allBooths
    .map((booth) => {
      const arrivals = booth.arrivals.filter((arrival) =>
        isHandoffTaken(arrival.slipId, arrival.listing.id, taken),
      );
      return { ...booth, arrivals };
    })
    .filter((booth) => booth.arrivals.length > 0);

  return (
    <div data-sell-taken="">
      <script dangerouslySetInnerHTML={{ __html: TAKEN_MIRROR_SCRIPT }} />
      <MallHero>
        <MallCrumb label="Who left with it">
          <CrumbSep />
          <Link
            href={sellPath()}
            className="hover:text-foreground hover:underline"
          >
            Sell
          </Link>
          <CrumbSep />
          <Link
            href={sellDeskPath()}
            className="hover:text-foreground hover:underline"
          >
            Desk
          </Link>
          <CrumbSep />
          <span className="text-foreground">Taken</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            They walked
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a refund
          </Badge>
        </div>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Stallholder scribble</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Who left with it.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            They walked. Not a refund. Not a sold sticker. Physical lines from
            paid slips in this browser. Files stay in the folder.
          </p>
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-4">
        {coming.length === 0 ? (
          <p
            data-taken-coming-empty=""
            className="text-sm leading-6 text-muted-foreground"
          >
            Nobody is still coming up the drive.
          </p>
        ) : null}

        {coming.map((booth) => (
          <Card
            key={booth.stall.id}
            data-taken-coming={booth.stall.id}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                <Link
                  href={stallPath(booth.stall.slug)}
                  className="hover:underline"
                >
                  {booth.stall.boothName}
                </Link>
              </CardTitle>
              <CardDescription className="leading-6">
                Still coming. Hours stay on the queue and the pickup card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {booth.arrivals.map((arrival) => (
                  <li
                    key={`${arrival.slipId}:${arrival.listing.id}`}
                    data-taken-listing={arrival.listing.id}
                    data-taken-state="coming"
                    className="rounded-xl bg-card/80 p-4 ring-1 ring-primary/15"
                  >
                    <Link
                      href={listingPath(arrival.listing.id)}
                      className="font-medium text-foreground hover:underline"
                    >
                      {arrival.listing.title}
                    </Link>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {whoIsComing(arrival)} · slip{" "}
                      <Link
                        href={pickupSlipPath(arrival.slipId)}
                        className="font-mono text-xs text-foreground hover:underline"
                      >
                        {arrival.slipId}
                      </Link>
                    </span>
                    <div className="mt-3">
                      <TakenButton
                        slipId={arrival.slipId}
                        listingId={arrival.listing.id}
                        intent="taken"
                        returnTo={sellTakenPath()}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        {left.length > 0 ? (
          <div data-taken-left="" className="grid gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Left with it
            </p>
            {left.map((booth) => (
              <Card
                key={`left-${booth.stall.id}`}
                data-taken-left-booth={booth.stall.id}
                className="bg-card"
              >
                <CardHeader>
                  <CardTitle className="font-heading text-xl">
                    <Link
                      href={stallPath(booth.stall.slug)}
                      className="hover:underline"
                    >
                      {booth.stall.boothName}
                    </Link>
                  </CardTitle>
                  <CardDescription className="leading-6">
                    They walked. Put it back on the drive if they never showed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {booth.arrivals.map((arrival) => (
                      <li
                        key={`${arrival.slipId}:${arrival.listing.id}`}
                        data-taken-listing={arrival.listing.id}
                        data-taken-state="left"
                        className="rounded-xl bg-card/80 p-4 ring-1 ring-primary/15"
                      >
                        <Link
                          href={listingPath(arrival.listing.id)}
                          className="font-medium text-foreground hover:underline"
                        >
                          {arrival.listing.title}
                        </Link>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {whoIsComing(arrival)} · slip{" "}
                          <Link
                            href={pickupSlipPath(arrival.slipId)}
                            className="font-mono text-xs text-foreground hover:underline"
                          >
                            {arrival.slipId}
                          </Link>
                        </span>
                        <div className="mt-3">
                          <TakenButton
                            slipId={arrival.slipId}
                            listingId={arrival.listing.id}
                            intent="waiting"
                            returnTo={sellTakenPath()}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={sellDeskQueuePath()} />}
          >
            Driveway queue
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
