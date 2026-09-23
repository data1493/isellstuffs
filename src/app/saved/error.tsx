"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { savedPath } from "@/lib/paths";

export default function SavedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Later pile"
      title="The pile slipped off the table."
      body="The later pile did not load. Try again, or walk a listing and park something there."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open the pile again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={savedPath()} />}
          >
            Back to later pile
          </Button>
        </>
      }
    />
  );
}
