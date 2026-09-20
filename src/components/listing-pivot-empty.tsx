import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PIVOT_EMPTY_LINE, PIVOT_TABLE_LINE } from "@/lib/listing-pivot";
import { listingPath } from "@/lib/paths";

export function ListingPivotEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pivot-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pivot not taped"
        title={PIVOT_EMPTY_LINE}
        body={`${PIVOT_TABLE_LINE} Tape it when walkers still want a shop pivot. It does not drop the tote or mark it sold.`}
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
