import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RECAP_EMPTY_LINE, RECAP_TABLE_LINE } from "@/lib/listing-recap";
import { listingPath } from "@/lib/paths";

export function ListingRecapEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-recap-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Recap not taped"
        title={RECAP_EMPTY_LINE}
        body={`${RECAP_TABLE_LINE} Tape it when walkers still want a new save battery. It does not drop the tote or mark it sold.`}
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
