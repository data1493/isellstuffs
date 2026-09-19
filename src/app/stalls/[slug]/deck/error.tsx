"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function StallDeckError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="I don't have a deck"
      title="The deck note tore off."
      body="This deck note did not load. Plays, skip, and the leftover disc were not rewritten. Try again, or walk back to the stall."
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
