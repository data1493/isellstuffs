"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { feesPath } from "@/lib/paths";

export default function FeesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Board stuck"
      title="The fee board did not pin."
      body="The cut is still 10% from the stall. Try the board again, or walk back to sell."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the board again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={feesPath()} />}
          >
            Back to fees
          </Button>
        </>
      }
    />
  );
}
