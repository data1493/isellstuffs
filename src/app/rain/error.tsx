"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { rainPath, sellRainPath, walkPath } from "@/lib/paths";

export default function RainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Rain Sunday"
      title="The rain list slipped off the table."
      body="Rain Sunday did not load. Saturday hours were not rewritten. Try again, or tape a rain date from the desk."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open rain Sunday again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={rainPath()} />}
          >
            Back to rain Sunday
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellRainPath()} />}
          >
            Tape a rain date
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={walkPath()} />}
          >
            Saturday walk
          </Button>
        </>
      }
    />
  );
}
