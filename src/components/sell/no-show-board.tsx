"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { NoShowButton } from "@/components/sell/no-show-button";
import { NoShowEmpty, NoShowNotPhysical } from "@/components/sell/no-show-empty";
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
  NO_SHOW_MIRROR_SCRIPT,
  isHandoffNoShow,
  queueBoothsNotNoShow,
  readNoShowHandoffs,
  subscribeNoShow,
  type NoShowHandoff,
} from "@/lib/no-show-handoff";
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
  sellNoShowPath,
  sellPath,
  sellTakenPath,
  stallPath,
} from "@/lib/paths";
import {
  queueBoothsFromSlips,
  queueHasPhysicalLines,
} from "@/lib/seller-queue";
import {
  queueBoothsStillComing,
  readTakenHandoffs,
  subscribeTaken,
  type TakenHandoff,
} from "@/lib/taken-handoff";

const emptyOrders: OrderSlip[] = [];
const emptyTaken: TakenHandoff[] = [];
const emptyNoShow: NoShowHandoff[] = [];

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

export function NoShowView({
  seed,
  takenSeed = emptyTaken,
  noShowSeed = emptyNoShow,
}: {
  seed: OrderSlip | null;
  takenSeed?: TakenHandoff[];
  noShowSeed?: NoShowHandoff[];
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
  const missed = useSyncExternalStore(
    subscribeNoShow,
    readNoShowHandoffs,
    () => noShowSeed,
  );

  useEffect(() => {
    if (seed) {
      writeOrderSlip(seed);
    }
  }, [seed]);

  const orders = mergeSeed(stored, seed);

  if (orders.length === 0) {
    return <NoShowEmpty />;
  }

  if (!queueHasPhysicalLines(orders)) {
    const digital = orders.find((order) =>
      folderHasDigitalLines(order.listingIds),
    );
    return (
      <NoShowNotPhysical
        listingIds={digital?.listingIds ?? orders[0].listingIds}
        slip={digital?.id ?? orders[0].id}
      />
    );
  }

  const allBooths = queueBoothsFromSlips(orders);
  const waiting = queueBoothsNotNoShow(
    queueBoothsStillComing(allBooths, taken),
    missed,
  );
  const noShows = allBooths
    .map((booth) => {
      const arrivals = booth.arrivals.filter((arrival) =>
        isHandoffNoShow(arrival.slipId, arrival.listing.id, missed),
      );
      return { ...booth, arrivals };
    })
    .filter((booth) => booth.arrivals.length > 0);

  return (
    <div data-sell-noshow="">
      <script dangerouslySetInnerHTML={{ __html: NO_SHOW_MIRROR_SCRIPT }} />
      <MallHero>
        <MallCrumb label="They never showed">
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
          <span className="text-foreground">No-show</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            After the window
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a refund
          </Badge>
        </div>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Stallholder scribble</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            They never showed.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            The pickup window closed. The lamp goes back on the floor. Not a
            refund. The slip stays. Taken already closed a handoff — leave
            that scribble alone. Files stay in the folder.
          </p>
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-4">
        {waiting.length === 0 ? (
          <p
            data-noshow-waiting-empty=""
            className="text-sm leading-6 text-muted-foreground"
          >
            Nobody is still waiting on the drive.
          </p>
        ) : null}

        {waiting.map((booth) => (
          <Card
            key={booth.stall.id}
            data-noshow-waiting={booth.stall.id}
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
                Still waiting. Hours stay on the queue and the pickup card.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {booth.arrivals.map((arrival) => (
                  <li
                    key={`${arrival.slipId}:${arrival.listing.id}`}
                    data-noshow-listing={arrival.listing.id}
                    data-noshow-state="waiting"
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
                      <NoShowButton
                        slipId={arrival.slipId}
                        listingId={arrival.listing.id}
                        intent="noshow"
                        returnTo={sellNoShowPath()}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        {noShows.length > 0 ? (
          <div data-noshow-missed="" className="grid gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Didn&apos;t show
            </p>
            {noShows.map((booth) => (
              <Card
                key={`missed-${booth.stall.id}`}
                data-noshow-missed-booth={booth.stall.id}
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
                    Sold sticker came off. Put it back on the drive if they
                    might still walk up.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {booth.arrivals.map((arrival) => (
                      <li
                        key={`${arrival.slipId}:${arrival.listing.id}`}
                        data-noshow-listing={arrival.listing.id}
                        data-noshow-state="missed"
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
                          <NoShowButton
                            slipId={arrival.slipId}
                            listingId={arrival.listing.id}
                            intent="waiting"
                            returnTo={sellNoShowPath()}
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
            render={<Link href={sellTakenPath()} />}
          >
            Who left with it
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
