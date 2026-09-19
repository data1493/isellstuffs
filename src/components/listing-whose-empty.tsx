import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WHOSE_EMPTY_LINE, WHOSE_TABLE_LINE } from "@/lib/listing-whose";
import { listingPath } from "@/lib/paths";

export function ListingWhoseEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-whose-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Whose not taped"
        title={WHOSE_EMPTY_LINE}
        body={`${WHOSE_TABLE_LINE} Tape it when walkers want a grandma story. It does not drop the tote or write chip.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
