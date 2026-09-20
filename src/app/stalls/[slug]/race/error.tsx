"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function StallRaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="I don't have a race"
      title="The race note tore off."
      body="This race note did not load. The tote was not rewritten. Try again, or walk back to the stall."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Tape it again
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
