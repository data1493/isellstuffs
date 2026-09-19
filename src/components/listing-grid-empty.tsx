import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GRID_EMPTY_LINE, GRID_TABLE_LINE } from "@/lib/listing-grid";
import { listingPath } from "@/lib/paths";

export function ListingGridEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-grid-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still one page"
        title={GRID_EMPTY_LINE}
        body={`${GRID_TABLE_LINE} Tape it when walkers still want a spreadsheet. It does not drop the tote or rewrite the file.`}
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
