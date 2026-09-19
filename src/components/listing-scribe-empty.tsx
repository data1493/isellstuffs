import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SCRIBE_EMPTY_LINE, SCRIBE_TABLE_LINE } from "@/lib/listing-scribe";
import { listingPath } from "@/lib/paths";

export function ListingScribeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-scribe-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Scribe not taped"
        title={SCRIBE_EMPTY_LINE}
        body={`${SCRIBE_TABLE_LINE} Tape it when walkers still want the pot size scratched. It does not drop the tote or mark it sold.`}
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
