"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { walkPath, watchedPath } from "@/lib/paths";

export default function WalkError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Saturday walk"
      title="The scrap slipped off the table."
      body="The Saturday walk did not load. Watched tables, hours, and pack-up were not rewritten. Try again, or open the watched list."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open the walk again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={walkPath()} />}
          >
            Back to the walk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={watchedPath()} />}
          >
            Watched tables
          </Button>
        </>
      }
    />
  );
}
