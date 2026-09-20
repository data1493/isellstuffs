import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { QUENCH_EMPTY_LINE, QUENCH_TABLE_LINE } from "@/lib/listing-quench";
import { listingPath } from "@/lib/paths";

export function ListingQuenchEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-quench-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Quench not taped"
        title={QUENCH_EMPTY_LINE}
        body={`${QUENCH_TABLE_LINE} Tape it when walkers still want the wires dunked. It does not drop the tote or mark it sold.`}
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
