"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function ListingTagError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Tag"
      title="The tag tore off."
      body="This driveway tag did not load. Try again, or walk back to the listing."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the tag again
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
