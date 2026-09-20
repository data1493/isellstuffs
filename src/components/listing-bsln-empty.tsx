import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BSLN_EMPTY_LINE, BSLN_TABLE_LINE } from "@/lib/listing-bsln";
import { listingPath } from "@/lib/paths";

export function ListingBslnEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bsln-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Bsln not taped"
        title={BSLN_EMPTY_LINE}
        body={`${BSLN_TABLE_LINE} Tape it when walkers still want a shop baseline table. It does not drop the tote or mark it sold.`}
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
