import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FROST_EMPTY_LINE, FROST_TABLE_LINE } from "@/lib/listing-frost";
import { listingPath } from "@/lib/paths";

export function ListingFrostEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-frost-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Frost not taped"
        title={FROST_EMPTY_LINE}
        body={`${FROST_TABLE_LINE} Tape it when walkers still want shop frosting. It does not drop the tote or mark it sold.`}
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
