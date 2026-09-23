"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellPath } from "@/lib/paths";

export default function SellError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Table stuck"
      title="The folding table did not open."
      body="The stall is still on the floor. Try again, or walk the concourse and come back to list."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the table again
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
