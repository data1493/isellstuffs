import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LOOM_EMPTY_LINE, LOOM_TABLE_LINE } from "@/lib/listing-loom";
import { listingPath } from "@/lib/paths";

export function ListingLoomEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-loom-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Loom not taped"
        title={LOOM_EMPTY_LINE}
        body={`${LOOM_TABLE_LINE} Tape it when walkers still want the pile sleeved. It does not drop the tote or mark it sold.`}
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
