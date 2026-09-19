import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HOOD_EMPTY_LINE, HOOD_TABLE_LINE } from "@/lib/listing-hood";
import { listingPath } from "@/lib/paths";

export function ListingHoodEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hood-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Hood not taped"
        title={HOOD_EMPTY_LINE}
        body={`${HOOD_TABLE_LINE} Tape it when walkers still want a hood snapped on. It does not drop the tote or mark it sold.`}
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
