import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CELLS_EMPTY_LINE, CELLS_TABLE_LINE } from "@/lib/listing-cells";
import { listingPath } from "@/lib/paths";

export function ListingCellsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cells-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Cells are in"
        title={CELLS_EMPTY_LINE}
        body={`${CELLS_TABLE_LINE} Tape it when the handheld needs AAs. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
