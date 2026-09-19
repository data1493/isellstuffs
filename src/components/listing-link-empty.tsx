import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LINK_EMPTY_LINE, LINK_TABLE_LINE } from "@/lib/listing-link";
import { listingPath } from "@/lib/paths";

export function ListingLinkEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-link-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Link not taped"
        title={LINK_EMPTY_LINE}
        body={`${LINK_TABLE_LINE} Tape it when walkers still want a second brick. It does not drop the tote or mark it sold.`}
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
