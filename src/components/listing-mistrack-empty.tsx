import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { MISTRACK_EMPTY_LINE, MISTRACK_TABLE_LINE } from "@/lib/listing-mistrack";
import { listingPath } from "@/lib/paths";

export function ListingMistrackEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-mistrack-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Mistrack not taped"
        title={MISTRACK_EMPTY_LINE}
        body={`${MISTRACK_TABLE_LINE} Tape it when walkers still want a shop mistrack. It does not drop the tote or mark it sold.`}
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
