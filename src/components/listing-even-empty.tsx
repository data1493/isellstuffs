import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { EVEN_EMPTY_LINE, EVEN_TABLE_LINE } from "@/lib/listing-even";
import { listingPath } from "@/lib/paths";

export function ListingEvenEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-even-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Even not taped"
        title={EVEN_EMPTY_LINE}
        body={`${EVEN_TABLE_LINE} Tape it when walkers still want the pair evened. It does not drop the tote or mark it sold.`}
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
