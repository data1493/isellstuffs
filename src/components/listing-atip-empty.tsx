import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ATIP_EMPTY_LINE, ATIP_TABLE_LINE } from "@/lib/listing-atip";
import { listingPath } from "@/lib/paths";

export function ListingAtipEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-atip-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Atip not taped"
        title={ATIP_EMPTY_LINE}
        body={`${ATIP_TABLE_LINE} Tape it when walkers still want shop ATIP IDs. It does not drop the tote or mark it sold.`}
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
