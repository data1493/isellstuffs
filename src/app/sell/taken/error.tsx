"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellDeskPath, sellTakenPath } from "@/lib/paths";

export default function SellTakenError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Taken stuck"
      title="Who left with it did not open."
      body="Paid slips are still on this browser. Try the scribble again, or walk back to the desk."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the scribble again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellTakenPath()} />}
          >
            Back to taken
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Tuesday desk
          </Button>
        </>
      }
    />
  );
}
