"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { pickupPath } from "@/lib/paths";

export default function PickupError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Pickup stuck"
      title="The driveway card would not open."
      body="The walk-up slip did not load. The receipt is still the proof. Try again, or walk back to the tote."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the slip again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={pickupPath()} />}
          >
            Back to pickup
          </Button>
        </>
      }
    />
  );
}
