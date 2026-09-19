import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WORKBOOK_EMPTY_LINE, WORKBOOK_TABLE_LINE } from "@/lib/listing-workbook";
import { listingPath } from "@/lib/paths";

export function ListingWorkbookEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-workbook-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The file"
        title={WORKBOOK_EMPTY_LINE}
        body={`${WORKBOOK_TABLE_LINE} Tape it when walkers ask for a companion book. It does not drop the tote or rewrite the file.`}
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
