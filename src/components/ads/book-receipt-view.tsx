"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { BookReceiptCard } from "@/components/ads/book-receipt";
import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  readAdBookings,
  subscribeAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";
import { advertiseBookPath, advertisePath } from "@/lib/paths";

const emptyBookings: AdBooking[] = [];

export function BookReceiptView({ bookingId }: { bookingId: string }) {
  const bookings = useSyncExternalStore(
    subscribeAdBookings,
    readAdBookings,
    () => emptyBookings,
  );
  const booking = bookings.find((item) => item.id === bookingId);

  if (!booking) {
    return (
      <MallNotice
        padded={false}
        tone="missing"
        eyebrow="No slip"
        title="That booking is not on this desk."
        body="The receipt lives in this browser. The id is missing, this is a different machine, or the corner was never booked."
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={advertiseBookPath()} />}
            >
              Book next weekend
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={advertisePath()} />}
            >
              Rate card
            </Button>
          </>
        }
      />
    );
  }

  return <BookReceiptCard booking={booking} />;
}
