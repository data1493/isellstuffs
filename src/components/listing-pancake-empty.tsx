import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PANCAKE_EMPTY_LINE, PANCAKE_TABLE_LINE } from "@/lib/listing-pancake";
import { listingPath } from "@/lib/paths";

export function ListingPancakeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pancake-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pancake not taped"
        title={PANCAKE_EMPTY_LINE}
        body={`${PANCAKE_TABLE_LINE} Tape it when walkers still want the hubs packed. It does not drop the tote or mark it sold.`}
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
