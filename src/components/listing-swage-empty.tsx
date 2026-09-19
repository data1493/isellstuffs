import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SWAGE_EMPTY_LINE, SWAGE_TABLE_LINE } from "@/lib/listing-swage";
import { listingPath } from "@/lib/paths";

export function ListingSwageEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-swage-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Swage not taped"
        title={SWAGE_EMPTY_LINE}
        body={`${SWAGE_TABLE_LINE} Tape it when walkers still want the neck squeezed. It does not drop the tote or mark it sold.`}
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
