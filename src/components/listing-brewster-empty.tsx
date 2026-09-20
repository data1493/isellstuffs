import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BREWSTER_EMPTY_LINE, BREWSTER_TABLE_LINE } from "@/lib/listing-brewster";
import { listingPath } from "@/lib/paths";

export function ListingBrewsterEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-brewster-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Brewster not taped"
        title={BREWSTER_EMPTY_LINE}
        body={`${BREWSTER_TABLE_LINE} Tape it when walkers still want shop Brewster angle. It does not drop the tote or mark it sold.`}
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
