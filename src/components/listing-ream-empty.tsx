import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { REAM_EMPTY_LINE, REAM_TABLE_LINE } from "@/lib/listing-ream";
import { listingPath } from "@/lib/paths";

export function ListingReamEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-ream-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Ream not taped"
        title={REAM_EMPTY_LINE}
        body={`${REAM_TABLE_LINE} Tape it when walkers still want the neck opened. It does not drop the tote or mark it sold.`}
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
