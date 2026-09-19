"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { pickupHerePath, pickupPath } from "@/lib/paths";

export default function PickupHereError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Walking up stuck"
      title="Nobody is in the drive."
      body="The here flag did not open. The pickup slip is still the driveway card. Try again, or walk back to pickup."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try walking up again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={pickupHerePath()} />}
          >
            Back to walking up
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={pickupPath()} />}
          >
            Buyer pickup slip
          </Button>
        </>
      }
    />
  );
}
