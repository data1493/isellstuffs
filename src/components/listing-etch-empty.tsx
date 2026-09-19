import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ETCH_EMPTY_LINE, ETCH_TABLE_LINE } from "@/lib/listing-etch";
import { listingPath } from "@/lib/paths";

export function ListingEtchEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-etch-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Etch not taped"
        title={ETCH_EMPTY_LINE}
        body={`${ETCH_TABLE_LINE} Tape it when walkers still want the deadwax read. It does not drop the tote or mark it sold.`}
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
