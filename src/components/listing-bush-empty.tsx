import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BUSH_EMPTY_LINE, BUSH_TABLE_LINE } from "@/lib/listing-bush";
import { listingPath } from "@/lib/paths";

export function ListingBushEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bush-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Bush not taped"
        title={BUSH_EMPTY_LINE}
        body={`${BUSH_TABLE_LINE} Tape it when walkers still want the neck sleeved. It does not drop the tote or mark it sold.`}
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
