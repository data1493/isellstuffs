import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PLAYS_EMPTY_LINE, PLAYS_TABLE_LINE } from "@/lib/listing-plays";
import { listingPath } from "@/lib/paths";

export function ListingPlaysEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-plays-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Never spun"
        title={PLAYS_EMPTY_LINE}
        body={`${PLAYS_TABLE_LINE} Tape it when the needle already dropped. It does not drop the tote or mark it tested.`}
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
