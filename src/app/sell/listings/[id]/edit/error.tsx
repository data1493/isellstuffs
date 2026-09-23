"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellDeskPath, sellPath } from "@/lib/paths";

export default function RetapeListingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Tape stuck"
      title="The retape form did not open."
      body="The booth is still on the floor. Try again, or walk back to the desk."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the tape again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
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
