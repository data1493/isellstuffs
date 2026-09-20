import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BLOWHOLE_EMPTY_LINE, BLOWHOLE_TABLE_LINE } from "@/lib/listing-blowhole";
import { listingPath } from "@/lib/paths";

export function ListingBlowholeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-blowhole-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Blowhole not taped"
        title={BLOWHOLE_EMPTY_LINE}
        body={`${BLOWHOLE_TABLE_LINE} Tape it when walkers still want the joint shop-blowholed. It does not drop the tote or mark it sold.`}
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
