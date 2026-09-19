import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BRAID_EMPTY_LINE, BRAID_TABLE_LINE } from "@/lib/listing-braid";
import { listingPath } from "@/lib/paths";

export function ListingBraidEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-braid-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Braid not taped"
        title={BRAID_EMPTY_LINE}
        body={`${BRAID_TABLE_LINE} Tape it when walkers still want the drawer plaited. It does not drop the tote or mark it sold.`}
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
