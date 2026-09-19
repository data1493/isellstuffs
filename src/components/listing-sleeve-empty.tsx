import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SLEEVE_EMPTY_LINE, SLEEVE_TABLE_LINE } from "@/lib/listing-sleeve";
import { listingPath } from "@/lib/paths";

export function ListingSleeveEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-sleeve-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="No grocery bag tape"
        title={SLEEVE_EMPTY_LINE}
        body={`${SLEEVE_TABLE_LINE} Tape it when the jacket walked and the LP lives in a bag. It does not drop the tote or mark it sold.`}
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
