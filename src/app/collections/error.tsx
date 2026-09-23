"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { collectionsPath } from "@/lib/paths";

export default function CollectionsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Racks stuck"
      title="The collections did not set up."
      body="The floor is still open. Try the racks again, or walk the concourse and pick something yourself."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Tape them again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={collectionsPath()} />}
          >
            Back to collections
          </Button>
        </>
      }
    />
  );
}
