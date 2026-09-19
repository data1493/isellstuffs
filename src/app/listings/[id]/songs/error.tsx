"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function ListingSongsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="I will not title the songs"
      title="The untitled-songs card tore off."
      body="This untitled-songs check did not load. Try again, or walk back to the listing."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the songs again
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
