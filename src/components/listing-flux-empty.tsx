import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FLUX_EMPTY_LINE, FLUX_TABLE_LINE } from "@/lib/listing-flux";
import { listingPath } from "@/lib/paths";

export function ListingFluxEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-flux-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Flux not taped"
        title={FLUX_EMPTY_LINE}
        body={`${FLUX_TABLE_LINE} Tape it when walkers still want the ends fluxed. It does not drop the tote or mark it sold.`}
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
