import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PILLOW_EMPTY_LINE, PILLOW_TABLE_LINE } from "@/lib/listing-pillow";
import { listingPath } from "@/lib/paths";

export function ListingPillowEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pillow-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pillow not taped"
        title={PILLOW_EMPTY_LINE}
        body={`${PILLOW_TABLE_LINE} Tape it when walkers still want the BGA left head-in-pillow. It does not drop the tote or mark it sold.`}
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
