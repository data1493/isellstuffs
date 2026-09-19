import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WARP_EMPTY_LINE, WARP_TABLE_LINE } from "@/lib/listing-warp";
import { listingPath } from "@/lib/paths";

export function ListingWarpEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-warp-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Warp not taped"
        title={WARP_EMPTY_LINE}
        body={`${WARP_TABLE_LINE} Tape it when walkers still want it under books. It does not drop the tote or mark it sold.`}
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
