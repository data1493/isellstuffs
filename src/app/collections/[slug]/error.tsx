"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { collectionsPath } from "@/lib/paths";

export default function CollectionSlugError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Rack stuck"
      title="This collection did not set up."
      body="The tape is still on the table. Try again, or pick another rack."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Line it up again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={collectionsPath()} />}
          >
            Other racks
          </Button>
        </>
      }
    />
  );
}
