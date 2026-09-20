import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { REBALL_EMPTY_LINE, REBALL_TABLE_LINE } from "@/lib/listing-reball";
import { listingPath } from "@/lib/paths";

export function ListingReballEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-reball-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Reball not taped"
        title={REBALL_EMPTY_LINE}
        body={`${REBALL_TABLE_LINE} Tape it when walkers still want new spheres on the CPU. It does not drop the tote or mark it sold.`}
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
