"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { lotPath } from "@/lib/paths";

export default function LotError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Lot stuck"
      title="Could not read who set up."
      body="The lot map did not load. Pack-up flags were not rewritten. Try again, or walk the concourse."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Check the lot again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={lotPath()} />}
          >
            Back to the lot
          </Button>
        </>
      }
    />
  );
}
