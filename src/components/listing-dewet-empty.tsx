import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DEWET_EMPTY_LINE, DEWET_TABLE_LINE } from "@/lib/listing-dewet";
import { listingPath } from "@/lib/paths";

export function ListingDewetEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dewet-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dewet not taped"
        title={DEWET_EMPTY_LINE}
        body={`${DEWET_TABLE_LINE} Tape it when walkers still want the BGA shop-dewet. It does not drop the tote or mark it sold.`}
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
