import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ANNEAL_EMPTY_LINE, ANNEAL_TABLE_LINE } from "@/lib/listing-anneal";
import { listingPath } from "@/lib/paths";

export function ListingAnnealEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-anneal-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Anneal not taped"
        title={ANNEAL_EMPTY_LINE}
        body={`${ANNEAL_TABLE_LINE} Tape it when walkers still want the balloon back. It does not drop the tote or mark it sold.`}
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
