import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ECCENTRIC_EMPTY_LINE, ECCENTRIC_TABLE_LINE } from "@/lib/listing-eccentric";
import { listingPath } from "@/lib/paths";

export function ListingEccentricEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-eccentric-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Eccentric not taped"
        title={ECCENTRIC_EMPTY_LINE}
        body={`${ECCENTRIC_TABLE_LINE} Tape it when walkers still want a shop recenter. It does not drop the tote or mark it sold.`}
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
