import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PINK_EMPTY_LINE, PINK_TABLE_LINE } from "@/lib/listing-pink";
import { listingPath } from "@/lib/paths";

export function ListingPinkEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pink-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pink not taped"
        title={PINK_EMPTY_LINE}
        body={`${PINK_TABLE_LINE} Tape it when walkers still want the raw hem zigzagged. It does not drop the tote or mark it sold.`}
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
