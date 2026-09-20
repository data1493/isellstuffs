import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SHEAR_EMPTY_LINE, SHEAR_TABLE_LINE } from "@/lib/listing-shear";
import { listingPath } from "@/lib/paths";

export function ListingShearEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-shear-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Shear not taped"
        title={SHEAR_EMPTY_LINE}
        body={`${SHEAR_TABLE_LINE} Tape it when walkers still want a shop pile clip. It does not drop the tote or mark it sold.`}
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
