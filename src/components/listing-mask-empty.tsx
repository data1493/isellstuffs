import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { MASK_EMPTY_LINE, MASK_TABLE_LINE } from "@/lib/listing-mask";
import { listingPath } from "@/lib/paths";

export function ListingMaskEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-mask-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Mask not taped"
        title={MASK_EMPTY_LINE}
        body={`${MASK_TABLE_LINE} Tape it when walkers still want the solder mask back. It does not drop the tote or mark it sold.`}
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
