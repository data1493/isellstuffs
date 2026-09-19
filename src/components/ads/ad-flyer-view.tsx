"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { AdFlyerMissing } from "@/components/ads/ad-flyer-missing";
import { AdFlyerSheet } from "@/components/ads/ad-flyer-sheet";
import { CampaignUrlButton } from "@/components/ads/campaign-url-button";
import { SyncAdBookings } from "@/components/ads/sync-ad-bookings";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  readAdBookings,
  subscribeAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";
import { findAdBooking } from "@/lib/ad-flyer";
import {
  advertiseBookPath,
  advertisePath,
  advertiseReceiptPath,
} from "@/lib/paths";

const emptyBookings: AdBooking[] = [];

export function AdFlyerView({
  bookingId,
  seed,
}: {
  bookingId: string;
  seed?: AdBooking;
}) {
  const stored = useSyncExternalStore(
    subscribeAdBookings,
    readAdBookings,
    () => emptyBookings,
  );
  const booking = seed ?? findAdBooking(stored, bookingId);

  if (!booking) {
    return <AdFlyerMissing />;
  }

  return (
    <div>
      {seed ? <SyncAdBookings booking={seed} /> : null}

      <MallHero className="print:hidden">
        <MallCrumb label="Ad flyer">
          <CrumbSep />
          <Link
            href={advertisePath()}
            className="hover:text-foreground hover:underline"
          >
            Advertise
          </Link>
          <CrumbSep />
          <Link
            href={advertiseReceiptPath(booking.id)}
            className="hover:text-foreground hover:underline"
          >
            Receipt
          </Link>
          <CrumbSep />
          <span className="text-foreground">Flyer</span>
        </MallCrumb>

        <Badge variant="secondary" className="w-fit rounded-full">
          Take-home · stand-in
        </Badge>

        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Tape this to the table.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            A souvenir sheet for the corner you bought. Screenshot it or print
            it. You bought light, not a rewrite.
          </p>
        </div>
      </MallHero>

      <MallSection className="border-b border-border" innerClassName="grid max-w-2xl gap-6">
        <AdFlyerSheet booking={booking} />

        <div className="flex flex-col gap-3 print:hidden">
          <Button
            className="w-full rounded-full sm:w-auto"
            render={<Link href={advertiseReceiptPath(booking.id)} />}
          >
            Back to the slip
          </Button>
          <CampaignUrlButton bookingId={booking.id} seed={booking} />
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={advertiseBookPath()} />}
          >
            Book another corner
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
