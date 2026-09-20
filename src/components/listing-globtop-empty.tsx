import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GLOBTOP_EMPTY_LINE, GLOBTOP_TABLE_LINE } from "@/lib/listing-globtop";
import { listingPath } from "@/lib/paths";

export function ListingGlobtopEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-globtop-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Globtop not taped"
        title={GLOBTOP_EMPTY_LINE}
        body={`${GLOBTOP_TABLE_LINE} Tape it when walkers still want shop encapsulant. It does not drop the tote or mark it sold.`}
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
