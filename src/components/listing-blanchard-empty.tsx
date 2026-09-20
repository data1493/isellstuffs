import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BLANCHARD_EMPTY_LINE, BLANCHARD_TABLE_LINE } from "@/lib/listing-blanchard";
import { listingPath } from "@/lib/paths";

export function ListingBlanchardEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-blanchard-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Blanchard not taped"
        title={BLANCHARD_EMPTY_LINE}
        body={`${BLANCHARD_TABLE_LINE} Tape it when walkers still want a shop Blanchard grind of the lid. It does not drop the tote or mark it sold.`}
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
