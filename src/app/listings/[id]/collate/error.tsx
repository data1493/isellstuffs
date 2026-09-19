"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function ListingCollateError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="I will not collate them"
      title="The collate card tore off."
      body="This collate check did not load. Try again, or walk back to the listing."
      actions={
        <>
          <Button className="h-11 w-full rounded-full px-5 sm:w-auto" onClick={reset}>
            Try the collate note again
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href="/explore" />}
          >
            Walk the concourse
          </Button>
        </>
      }
    />
  );
}
