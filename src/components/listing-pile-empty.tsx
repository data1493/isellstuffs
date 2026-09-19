import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PILE_EMPTY_LINE, PILE_TABLE_LINE } from "@/lib/listing-pile";
import { listingPath } from "@/lib/paths";

export function ListingPileEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pile-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="You can pick one"
        title={PILE_EMPTY_LINE}
        body={`${PILE_TABLE_LINE} Tape it when the tangle walks as one drawer. It does not drop the tote or mark it sold.`}
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
