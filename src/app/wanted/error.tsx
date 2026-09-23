"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { wantedPath } from "@/lib/paths";

export default function WantedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Hunt board stuck"
      title="The cork would not hold."
      body="The hunt board did not load. Nothing listed. Try again, or tape the scrap once more."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open the board again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={wantedPath()} />}
          >
            Back to the hunt board
          </Button>
        </>
      }
    />
  );
}
