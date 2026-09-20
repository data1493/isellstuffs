import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HICKEY_EMPTY_LINE, HICKEY_TABLE_LINE } from "@/lib/listing-hickey";
import { listingPath } from "@/lib/paths";

export function ListingHickeyEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hickey-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Hickey not taped"
        title={HICKEY_EMPTY_LINE}
        body={`${HICKEY_TABLE_LINE} Tape it when walkers still want a shop pipe. It does not drop the tote or mark it sold.`}
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
