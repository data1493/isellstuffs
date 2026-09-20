import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ISRC_EMPTY_LINE, ISRC_TABLE_LINE } from "@/lib/listing-isrc";
import { listingPath } from "@/lib/paths";

export function ListingIsrcEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-isrc-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Isrc not taped"
        title={ISRC_EMPTY_LINE}
        body={`${ISRC_TABLE_LINE} Tape it when walkers still want shop ISRCs. It does not drop the tote or mark it sold.`}
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
