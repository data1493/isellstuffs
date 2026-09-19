import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CHIP_EMPTY_LINE, CHIP_TABLE_LINE } from "@/lib/listing-chip";
import { listingPath } from "@/lib/paths";

export function ListingChipEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-chip-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Rim is fine"
        title={CHIP_EMPTY_LINE}
        body={`${CHIP_TABLE_LINE} Tape it when the diner chip stays. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
