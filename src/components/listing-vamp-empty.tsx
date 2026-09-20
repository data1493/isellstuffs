import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { VAMP_EMPTY_LINE, VAMP_TABLE_LINE } from "@/lib/listing-vamp";
import { listingPath } from "@/lib/paths";

export function ListingVampEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-vamp-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Vamp not taped"
        title={VAMP_EMPTY_LINE}
        body={`${VAMP_TABLE_LINE} Tape it when walkers still want a shop vamp. It does not drop the tote or mark it sold.`}
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
