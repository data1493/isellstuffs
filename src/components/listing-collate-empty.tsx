import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  COLLATE_EMPTY_LINE,
  COLLATE_TABLE_LINE,
} from "@/lib/listing-collate";
import { listingPath } from "@/lib/paths";

export function ListingCollateEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-collate-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Collate not taped"
        title={COLLATE_EMPTY_LINE}
        body={`${COLLATE_TABLE_LINE} Tape it when walkers still want the pages gathered. It does not drop the tote or rewrite the file.`}
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
