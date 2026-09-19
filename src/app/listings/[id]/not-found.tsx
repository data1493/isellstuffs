import type { Metadata } from "next";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { missingListingMetadata } from "@/lib/seo";

export const metadata: Metadata = missingListingMetadata();

export default function ListingNotFound() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Listing"
      title="That listing walked off"
      body="No SKU with that id. It sold, the id is wrong, or it never made it onto the table."
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
