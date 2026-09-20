import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LTSH_EMPTY_LINE, LTSH_TABLE_LINE } from "@/lib/listing-ltsh";
import { listingPath } from "@/lib/paths";

export function ListingLtshEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-ltsh-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Ltsh not taped"
        title={LTSH_EMPTY_LINE}
        body={`${LTSH_TABLE_LINE} Tape it when walkers still want a shop linear-threshold table. It does not drop the tote or mark it sold.`}
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
