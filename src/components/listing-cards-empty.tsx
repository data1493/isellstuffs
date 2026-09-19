import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CARDS_EMPTY_LINE, CARDS_TABLE_LINE } from "@/lib/listing-cards";
import { listingPath } from "@/lib/paths";

export function ListingCardsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cards-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Cards still scans"
        title={CARDS_EMPTY_LINE}
        body={`${CARDS_TABLE_LINE} Tape it when walkers still want a typed cookbook. It does not drop the tote or rewrite the file.`}
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
