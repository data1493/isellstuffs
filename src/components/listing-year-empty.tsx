import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { YEAR_EMPTY_LINE, YEAR_TABLE_LINE } from "@/lib/listing-year";
import { listingPath } from "@/lib/paths";

export function ListingYearEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-year-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still a page"
        title={YEAR_EMPTY_LINE}
        body={`${YEAR_TABLE_LINE} Tape it when walkers still want a year. It does not drop the tote or rewrite the file.`}
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
