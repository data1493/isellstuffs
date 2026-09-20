import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BLACKPAD_EMPTY_LINE, BLACKPAD_TABLE_LINE } from "@/lib/listing-blackpad";
import { listingPath } from "@/lib/paths";

export function ListingBlackpadEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-blackpad-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Blackpad not taped"
        title={BLACKPAD_EMPTY_LINE}
        body={`${BLACKPAD_TABLE_LINE} Tape it when walkers still want the pads shop-blackpadded. It does not drop the tote or mark it sold.`}
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
