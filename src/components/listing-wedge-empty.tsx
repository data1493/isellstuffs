import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WEDGE_EMPTY_LINE, WEDGE_TABLE_LINE } from "@/lib/listing-wedge";
import { listingPath } from "@/lib/paths";

export function ListingWedgeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-wedge-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Wedge not taped"
        title={WEDGE_EMPTY_LINE}
        body={`${WEDGE_TABLE_LINE} Tape it when walkers still want a shop angle wedge. It does not drop the tote or mark it sold.`}
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
