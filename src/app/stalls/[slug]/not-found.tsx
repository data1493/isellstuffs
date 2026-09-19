import type { Metadata } from "next";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { missingStallMetadata } from "@/lib/seo";

export const metadata: Metadata = missingStallMetadata();

export default function StallNotFound() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Stall"
      title="That stall packed up"
      body="No booth with that slug. The folding table is gone, or the name is wrong."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/explore" />}>
            Walk the concourse
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/hubs" />}
          >
            See the hubs
          </Button>
        </>
      }
    />
  );
}
