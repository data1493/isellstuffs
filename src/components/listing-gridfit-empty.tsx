import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GRIDFIT_EMPTY_LINE, GRIDFIT_TABLE_LINE } from "@/lib/listing-gridfit";
import { listingPath } from "@/lib/paths";

export function ListingGridfitEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gridfit-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gridfit not taped"
        title={GRIDFIT_EMPTY_LINE}
        body={`${GRIDFIT_TABLE_LINE} Tape it when walkers still want shop TrueType instructions. It does not drop the tote or mark it sold.`}
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
