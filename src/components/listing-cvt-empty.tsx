import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CVT_EMPTY_LINE, CVT_TABLE_LINE } from "@/lib/listing-cvt";
import { listingPath } from "@/lib/paths";

export function ListingCvtEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cvt-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Cvt not taped"
        title={CVT_EMPTY_LINE}
        body={`${CVT_TABLE_LINE} Tape it when walkers still want a shop control-value table. It does not drop the tote or mark it sold.`}
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
