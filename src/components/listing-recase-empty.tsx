import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RECASE_EMPTY_LINE, RECASE_TABLE_LINE } from "@/lib/listing-recase";
import { listingPath } from "@/lib/paths";

export function ListingRecaseEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-recase-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Recase not taped"
        title={RECASE_EMPTY_LINE}
        body={`${RECASE_TABLE_LINE} Tape it when walkers still want a new shell. It does not drop the tote or mark it sold.`}
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
