import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { INSIDE_EMPTY_LINE, INSIDE_TABLE_LINE } from "@/lib/listing-inside";
import { listingPath } from "@/lib/paths";

export function ListingInsideEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-inside-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Inside not taped"
        title={INSIDE_EMPTY_LINE}
        body={`${INSIDE_TABLE_LINE} Tape it when walkers still want the missing movies named. It does not drop the tote or mark it sold.`}
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
