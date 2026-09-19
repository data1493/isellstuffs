import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FITS_EMPTY_LINE, FITS_TABLE_LINE } from "@/lib/listing-fits";
import { listingPath } from "@/lib/paths";

export function ListingFitsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-fits-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Just a lid"
        title={FITS_EMPTY_LINE}
        body={`${FITS_TABLE_LINE} Tape it when the pot walked. It does not drop the tote or pair a second title.`}
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
