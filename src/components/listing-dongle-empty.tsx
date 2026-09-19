import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DONGLE_EMPTY_LINE, DONGLE_TABLE_LINE } from "@/lib/listing-dongle";
import { listingPath } from "@/lib/paths";

export function ListingDongleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dongle-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dongle not taped"
        title={DONGLE_EMPTY_LINE}
        body={`${DONGLE_TABLE_LINE} Tape it when walkers still want USB-C for the laptop. It does not drop the tote or mark it sold.`}
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
