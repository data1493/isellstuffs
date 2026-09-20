import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BILLBOARD_EMPTY_LINE, BILLBOARD_TABLE_LINE } from "@/lib/listing-billboard";
import { listingPath } from "@/lib/paths";

export function ListingBillboardEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-billboard-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Billboard not taped"
        title={BILLBOARD_EMPTY_LINE}
        body={`${BILLBOARD_TABLE_LINE} Tape it when walkers still want the chip stood on its long edge. It does not drop the tote or mark it sold.`}
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
