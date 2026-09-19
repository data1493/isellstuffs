import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CINCH_EMPTY_LINE, CINCH_TABLE_LINE } from "@/lib/listing-cinch";
import { listingPath } from "@/lib/paths";

export function ListingCinchEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cinch-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Cinch not taped"
        title={CINCH_EMPTY_LINE}
        body={`${CINCH_TABLE_LINE} Tape it when walkers still want the waist cinched. It does not drop the tote or mark it sold.`}
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
