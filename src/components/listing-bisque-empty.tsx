import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BISQUE_EMPTY_LINE, BISQUE_TABLE_LINE } from "@/lib/listing-bisque";
import { listingPath } from "@/lib/paths";

export function ListingBisqueEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bisque-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Bisque not taped"
        title={BISQUE_EMPTY_LINE}
        body={`${BISQUE_TABLE_LINE} Tape it when walkers still want the clay fired. It does not drop the tote or mark it sold.`}
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
