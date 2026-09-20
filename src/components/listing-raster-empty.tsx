import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  RASTER_EMPTY_LINE,
  RASTER_TABLE_LINE,
} from "@/lib/listing-raster";
import { listingPath } from "@/lib/paths";

export function ListingRasterEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-raster-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Raster not taped"
        title={RASTER_EMPTY_LINE}
        body={`${RASTER_TABLE_LINE} Tape it when walkers still want the directory flattened. It does not drop the tote or rewrite the file.`}
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
