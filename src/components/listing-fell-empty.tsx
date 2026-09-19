import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FELL_EMPTY_LINE, FELL_TABLE_LINE } from "@/lib/listing-fell";
import { listingPath } from "@/lib/paths";

export function ListingFellEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-fell-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Fell not taped"
        title={FELL_EMPTY_LINE}
        body={`${FELL_TABLE_LINE} Tape it when walkers still want the pits folded inside. It does not drop the tote or mark it sold.`}
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
