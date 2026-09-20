import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { UPSET_EMPTY_LINE, UPSET_TABLE_LINE } from "@/lib/listing-upset";
import { listingPath } from "@/lib/paths";

export function ListingUpsetEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-upset-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Upset not taped"
        title={UPSET_EMPTY_LINE}
        body={`${UPSET_TABLE_LINE} Tape it when walkers still want the wire ends thickened. It does not drop the tote or mark it sold.`}
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
