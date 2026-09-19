import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BURNISH_EMPTY_LINE, BURNISH_TABLE_LINE } from "@/lib/listing-burnish";
import { listingPath } from "@/lib/paths";

export function ListingBurnishEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-burnish-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Burnish not taped"
        title={BURNISH_EMPTY_LINE}
        body={`${BURNISH_TABLE_LINE} Tape it when walkers still want the edge burnished. It does not drop the tote or mark it sold.`}
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
