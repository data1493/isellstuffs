import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FLOCK_EMPTY_LINE, FLOCK_TABLE_LINE } from "@/lib/listing-flock";
import { listingPath } from "@/lib/paths";

export function ListingFlockEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-flock-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Flock not taped"
        title={FLOCK_EMPTY_LINE}
        body={`${FLOCK_TABLE_LINE} Tape it when walkers still want the trays sueded. It does not drop the tote or mark it sold.`}
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
