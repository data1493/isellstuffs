import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RIVET_EMPTY_LINE, RIVET_TABLE_LINE } from "@/lib/listing-rivet";
import { listingPath } from "@/lib/paths";

export function ListingRivetEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-rivet-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Rivet not taped"
        title={RIVET_EMPTY_LINE}
        body={`${RIVET_TABLE_LINE} Tape it when walkers still want the shade pinned. It does not drop the tote or mark it sold.`}
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
