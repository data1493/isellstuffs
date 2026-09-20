import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  TENTER_EMPTY_LINE,
  TENTER_TABLE_LINE,
} from "@/lib/listing-tenter";
import { listingPath } from "@/lib/paths";

export function ListingTenterEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-tenter-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Tenter not taped"
        title={TENTER_EMPTY_LINE}
        body={`${TENTER_TABLE_LINE} Tape it when walkers still want a shop frame. It does not drop the tote or mark it sold.`}
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
