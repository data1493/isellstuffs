import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { POGO_EMPTY_LINE, POGO_TABLE_LINE } from "@/lib/listing-pogo";
import { listingPath } from "@/lib/paths";

export function ListingPogoEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pogo-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pogo not taped"
        title={POGO_EMPTY_LINE}
        body={`${POGO_TABLE_LINE} Tape it when walkers still want the fused cart sprung. It does not drop the tote or mark it sold.`}
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
