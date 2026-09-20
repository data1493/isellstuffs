import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TOMBSTONE_EMPTY_LINE, TOMBSTONE_TABLE_LINE } from "@/lib/listing-tombstone";
import { listingPath } from "@/lib/paths";

export function ListingTombstoneEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-tombstone-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Tombstone not taped"
        title={TOMBSTONE_EMPTY_LINE}
        body={`${TOMBSTONE_TABLE_LINE} Tape it when walkers still want the standing joint reworked. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
