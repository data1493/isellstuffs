import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CORD_EMPTY_LINE, CORD_TABLE_LINE } from "@/lib/listing-cord";
import { listingPath } from "@/lib/paths";

export function ListingCordEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cord-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="No rewire tape"
        title={CORD_EMPTY_LINE}
        body={`${CORD_TABLE_LINE} Tape it when the lamp already has a new cord. It does not drop the tote or crack the Game Boy blister.`}
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
