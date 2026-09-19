import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TIN_EMPTY_LINE, TIN_TABLE_LINE } from "@/lib/listing-tin";
import { listingPath } from "@/lib/paths";

export function ListingTinEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-tin-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Tin not taped"
        title={TIN_EMPTY_LINE}
        body={`${TIN_TABLE_LINE} Tape it when walkers still want the ends tinned. It does not drop the tote or mark it sold.`}
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
