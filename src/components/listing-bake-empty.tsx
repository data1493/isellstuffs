import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BAKE_EMPTY_LINE, BAKE_TABLE_LINE } from "@/lib/listing-bake";
import { listingPath } from "@/lib/paths";

export function ListingBakeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bake-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Bake not taped"
        title={BAKE_EMPTY_LINE}
        body={`${BAKE_TABLE_LINE} Tape it when walkers still want the sticky-shed baked. It does not drop the tote or write a hiss.`}
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
