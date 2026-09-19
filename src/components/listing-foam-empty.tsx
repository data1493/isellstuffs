import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FOAM_EMPTY_LINE, FOAM_TABLE_LINE } from "@/lib/listing-foam";
import { listingPath } from "@/lib/paths";

export function ListingFoamEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-foam-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Foam not taped"
        title={FOAM_EMPTY_LINE}
        body={`${FOAM_TABLE_LINE} Tape it when walkers still want the jewels padded. It does not drop the tote or mark it sold.`}
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
