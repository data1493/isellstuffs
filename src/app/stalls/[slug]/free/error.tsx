"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function StallFreeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Free box"
      title="The pile blew over."
      body="This cardboard free pile did not load. Try again, or walk back to the stall. Nothing listed. Nothing bagged."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Check the pile again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Walk the concourse
          </Button>
        </>
      }
    />
  );
}
