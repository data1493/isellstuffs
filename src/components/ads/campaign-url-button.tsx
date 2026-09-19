"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  readAdBookings,
  subscribeAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";
import { campaignPathForBooking } from "@/lib/booked-campaign";

const emptyBookings: AdBooking[] = [];

export function CampaignUrlButton({
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
  const booking = seed ?? stored.find((item) => item.id === bookingId);
  const href = booking ? campaignPathForBooking(booking) : undefined;

  if (!href) {
    return null;
  }

  return (
    <Button
      variant="outline"
      className="w-full rounded-full sm:w-auto"
      render={<Link href={href} />}
    >
      Open the campaign URL
    </Button>
  );
}
