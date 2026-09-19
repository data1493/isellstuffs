import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SHIM_EMPTY_LINE, SHIM_TABLE_LINE } from "@/lib/listing-shim";
import { listingPath } from "@/lib/paths";

export function ListingShimEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-shim-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Shim not taped"
        title={SHIM_EMPTY_LINE}
        body={`${SHIM_TABLE_LINE} Tape it when walkers still want a sit-flat. It does not drop the tote or mark it sold.`}
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
