import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FRINGE_EMPTY_LINE, FRINGE_TABLE_LINE } from "@/lib/listing-fringe";
import { listingPath } from "@/lib/paths";

export function ListingFringeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-fringe-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Fringe not taped"
        title={FRINGE_EMPTY_LINE}
        body={`${FRINGE_TABLE_LINE} Tape it when walkers still want shop light-bands. It does not drop the tote or mark it sold.`}
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
