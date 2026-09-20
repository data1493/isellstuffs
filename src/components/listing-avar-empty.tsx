import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { AVAR_EMPTY_LINE, AVAR_TABLE_LINE } from "@/lib/listing-avar";
import { listingPath } from "@/lib/paths";

export function ListingAvarEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-avar-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Avar not taped"
        title={AVAR_EMPTY_LINE}
        body={`${AVAR_TABLE_LINE} Tape it when walkers still want a shop axis-variation map. It does not drop the tote or mark it sold.`}
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
