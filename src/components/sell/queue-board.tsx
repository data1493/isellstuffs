"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import {
  QueueDigitalOnly,
  QueueEmpty,
} from "@/components/sell/queue-empty";
import { NoShowButton } from "@/components/sell/no-show-button";
import { TakenButton } from "@/components/sell/taken-button";
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
  HERE_COPY,
  HERE_MIRROR_SCRIPT,
  isHandoffHere,
  readHereHandoffs,
  subscribeHere,
  type HereHandoff,
} from "@/lib/here-handoff";
import {
  readOrderSlips,
  subscribeOrderSlips,
  writeOrderSlip,
  type OrderSlip,
} from "@/lib/order-history";
import {
  NO_SHOW_MIRROR_SCRIPT,
  queueBoothsNotNoShow,
  readNoShowHandoffs,
  subscribeNoShow,
  type NoShowHandoff,
} from "@/lib/no-show-handoff";
import {
  folderPath,
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
  TAKEN_MIRROR_SCRIPT,
  type TakenHandoff,
} from "@/lib/taken-handoff";

const emptyOrders: OrderSlip[] = [];
const emptyTaken: TakenHandoff[] = [];
const emptyNoShow: NoShowHandoff[] = [];
const emptyHere: HereHandoff[] = [];

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

export function QueueView({
  seed,
  takenSeed = emptyTaken,
  noShowSeed = emptyNoShow,
  hereSeed = emptyHere,
}: {
  seed: OrderSlip | null;
  takenSeed?: TakenHandoff[];
  noShowSeed?: NoShowHandoff[];
  hereSeed?: HereHandoff[];
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
  const here = useSyncExternalStore(
    subscribeHere,
    readHereHandoffs,
    () => hereSeed,
  );

  useEffect(() => {
    if (seed) {
      writeOrderSlip(seed);
    }
  }, [seed]);

  const orders = mergeSeed(stored, seed);

  if (orders.length === 0) {
    return <QueueEmpty />;
  }

  if (!queueHasPhysicalLines(orders)) {
    const digital = orders.find((order) =>
      folderHasDigitalLines(order.listingIds),
    );
    return (
      <QueueDigitalOnly
        listingIds={digital?.listingIds ?? orders[0].listingIds}
        slip={digital?.id ?? orders[0].id}
      />
    );
  }

  const booths = queueBoothsNotNoShow(
    queueBoothsStillComing(queueBoothsFromSlips(orders), taken),
    missed,
  );
  const folderSlip = orders.find((order) =>
    folderHasDigitalLines(order.listingIds),
  );

  if (booths.length === 0) {
    if (folderSlip) {
      return (
        <QueueDigitalOnly
          listingIds={folderSlip.listingIds}
          slip={folderSlip.id}
        />
      );
    }
    return <QueueEmpty />;
  }

  return (
    <div data-desk-queue="">
      <script dangerouslySetInnerHTML={{ __html: TAKEN_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: NO_SHOW_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: HERE_MIRROR_SCRIPT }} />
      <MallHero>
        <MallCrumb label="Driveway queue">
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
          <span className="text-foreground">Queue</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Who is coming
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No shipping
          </Badge>
        </div>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Stallholder driveway</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Who is coming up the drive.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Physical lines from paid pickup slips in this browser. Hours hang
            on the booth. Files stay in the folder. The mall does not ship.
          </p>
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-4">
        {booths.map((booth) => (
          <Card
            key={booth.stall.id}
            data-queue-booth={booth.stall.id}
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
                <ul className="space-y-2">
                  {booth.arrivals.map((arrival) => (
                    <li
                      key={`${arrival.slipId}:${arrival.listing.id}`}
                      data-queue-listing={arrival.listing.id}
                    >
                      <Link
                        href={listingPath(arrival.listing.id)}
                        className="font-medium text-foreground hover:underline"
                      >
                        {arrival.listing.title}
                      </Link>
                      <span className="mt-0.5 block text-sm">
                        {whoIsComing(arrival)} · slip{" "}
                        <Link
                          href={pickupSlipPath(arrival.slipId)}
                          className="font-mono text-xs text-foreground hover:underline"
                        >
                          {arrival.slipId}
                        </Link>
                      </span>
                      {isHandoffHere(
                        arrival.slipId,
                        arrival.listing.id,
                        here,
                      ) ? (
                        <span
                          data-queue-here={arrival.listing.id}
                          className="mt-1 block"
                        >
                          <Badge variant="secondary" className="rounded-full">
                            In the drive
                          </Badge>
                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {HERE_COPY}
                          </span>
                        </span>
                      ) : null}
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <TakenButton
                          slipId={arrival.slipId}
                          listingId={arrival.listing.id}
                          intent="taken"
                          returnTo={sellDeskQueuePath()}
                        />
                        <NoShowButton
                          slipId={arrival.slipId}
                          listingId={arrival.listing.id}
                          intent="noshow"
                          returnTo={sellDeskQueuePath()}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <aside
                data-queue-hours=""
                className="rounded-xl bg-card/80 p-4 ring-1 ring-primary/15"
              >
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  When they walk up
                </p>
                <p className="mt-1 font-heading text-lg tracking-tight text-foreground">
                  {booth.pickup.hours}
                </p>
                <p
                  data-queue-place=""
                  className="mt-1 text-sm leading-6 text-foreground"
                >
                  {booth.pickup.place}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {booth.pickup.note}
                </p>
              </aside>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {folderSlip ? (
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={folderPath(folderSlip.id)} />}
            >
              Files stay in the folder
            </Button>
          ) : null}
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
            render={<Link href={sellNoShowPath()} />}
          >
            They never showed
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
