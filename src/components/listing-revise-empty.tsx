import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { REVISE_EMPTY_LINE, REVISE_TABLE_LINE } from "@/lib/listing-revise";
import { listingPath } from "@/lib/paths";

export function ListingReviseEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-revise-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still one page"
        title={REVISE_EMPTY_LINE}
        body={`${REVISE_TABLE_LINE} Tape it when walkers still want this year’s numbers. It does not drop the tote or rewrite the file.`}
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
