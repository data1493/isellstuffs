"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { watchedPath } from "@/lib/paths";

export default function WatchedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Watched tables"
      title="The walk slipped off the table."
      body="The watched tables did not load. Try again, or open a stall and mark it."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open the walk again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={watchedPath()} />}
          >
            Back to watched tables
          </Button>
        </>
      }
    />
  );
}
