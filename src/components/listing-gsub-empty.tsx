import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GSUB_EMPTY_LINE, GSUB_TABLE_LINE } from "@/lib/listing-gsub";
import { listingPath } from "@/lib/paths";

export function ListingGsubEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gsub-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gsub not taped"
        title={GSUB_EMPTY_LINE}
        body={`${GSUB_TABLE_LINE} Tape it when walkers still want a shop glyph-substitution table. It does not drop the tote or mark it sold.`}
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
