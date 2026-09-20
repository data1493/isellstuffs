import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { VTA_EMPTY_LINE, VTA_TABLE_LINE } from "@/lib/listing-vta";
import { listingPath } from "@/lib/paths";

export function ListingVtaEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-vta-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Vta not taped"
        title={VTA_EMPTY_LINE}
        body={`${VTA_TABLE_LINE} Tape it when walkers still want a shop VTA set. It does not drop the tote or mark it sold.`}
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
