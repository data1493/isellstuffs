import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WIND_EMPTY_LINE, WIND_TABLE_LINE } from "@/lib/listing-wind";
import { listingPath } from "@/lib/paths";

export function ListingWindEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-wind-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Wind not taped"
        title={WIND_EMPTY_LINE}
        body={`${WIND_TABLE_LINE} Tape it when walkers still want the first song cued. It does not drop the tote or mark it sold.`}
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
