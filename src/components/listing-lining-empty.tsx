import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LINING_EMPTY_LINE, LINING_TABLE_LINE } from "@/lib/listing-lining";
import { listingPath } from "@/lib/paths";

export function ListingLiningEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-lining-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Lining not taped"
        title={LINING_EMPTY_LINE}
        body={`${LINING_TABLE_LINE} Tape it when walkers still want a warm lining. It does not drop the tote or mark it sold.`}
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
