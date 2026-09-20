import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  COUNTERSINK_EMPTY_LINE,
  COUNTERSINK_TABLE_LINE,
} from "@/lib/listing-countersink";
import { listingPath } from "@/lib/paths";

export function ListingCountersinkEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-countersink-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Countersink not taped"
        title={COUNTERSINK_EMPTY_LINE}
        body={`${COUNTERSINK_TABLE_LINE} Tape it when walkers still want a shop cone. It does not drop the tote or mark it sold.`}
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
