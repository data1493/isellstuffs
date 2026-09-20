import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FETTLE_EMPTY_LINE, FETTLE_TABLE_LINE } from "@/lib/listing-fettle";
import { listingPath } from "@/lib/paths";

export function ListingFettleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-fettle-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Fettle not taped"
        title={FETTLE_EMPTY_LINE}
        body={`${FETTLE_TABLE_LINE} Tape it when walkers still want the rim dressed. It does not drop the tote or mark it sold.`}
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
