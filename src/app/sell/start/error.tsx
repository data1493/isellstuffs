"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellPath, sellStartPath } from "@/lib/paths";

export default function SellStartError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Walkthrough stuck"
      title="The first table did not open."
      body="The booths are still on the floor. Try the walkthrough again, or go back to sell."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the first table again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellStartPath()} />}
          >
            Start over
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
