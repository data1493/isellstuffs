import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOLD_EMPTY_LINE, BOLD_TABLE_LINE } from "@/lib/listing-bold";
import { listingPath } from "@/lib/paths";

export function ListingBoldEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bold-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Two weights"
        title={BOLD_EMPTY_LINE}
        body={`${BOLD_TABLE_LINE} Tape it when walkers still want a Bold. It does not drop the tote or rewrite the file.`}
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
