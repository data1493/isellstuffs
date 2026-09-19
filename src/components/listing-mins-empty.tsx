import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { MINS_EMPTY_LINE, MINS_TABLE_LINE } from "@/lib/listing-mins";
import { listingPath } from "@/lib/paths";

export function ListingMinsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-mins-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Open to minutes"
        title={MINS_EMPTY_LINE}
        body={`${MINS_TABLE_LINE} Tape it when walkers still want minutes on the cards, or how long. It does not drop the tote or rewrite the file.`}
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
