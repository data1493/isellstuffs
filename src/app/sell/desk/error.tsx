"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellPath } from "@/lib/paths";

export default function SellDeskError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Desk stuck"
      title="The stall desk did not open."
      body="The booth is still on the floor. Try the desk again, or walk back to sell and list from there."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the desk again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellPath()} />}
          >
            Back to sell
          </Button>
        </>
      }
    />
  );
}
