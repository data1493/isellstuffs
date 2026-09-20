import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { STAKE_EMPTY_LINE, STAKE_TABLE_LINE } from "@/lib/listing-stake";
import { listingPath } from "@/lib/paths";

export function ListingStakeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-stake-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Stake not taped"
        title={STAKE_EMPTY_LINE}
        body={`${STAKE_TABLE_LINE} Tape it when walkers still want the knob set. It does not drop the tote or mark it sold.`}
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
