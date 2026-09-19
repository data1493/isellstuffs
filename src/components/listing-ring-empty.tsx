import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RING_EMPTY_LINE, RING_TABLE_LINE } from "@/lib/listing-ring";
import { listingPath } from "@/lib/paths";

export function ListingRingEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-ring-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="No ring tape"
        title={RING_EMPTY_LINE}
        body={`${RING_TABLE_LINE} Tape it when the furniture already has a ring. It does not drop the tote or mark it as-is.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
