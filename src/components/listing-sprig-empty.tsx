import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SPRIG_EMPTY_LINE, SPRIG_TABLE_LINE } from "@/lib/listing-sprig";
import { listingPath } from "@/lib/paths";

export function ListingSprigEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-sprig-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Sprig not taped"
        title={SPRIG_EMPTY_LINE}
        body={`${SPRIG_TABLE_LINE} Tape it when walkers still want a shop relief. It does not drop the tote or mark it sold.`}
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
