import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { NEEDLE_EMPTY_LINE, NEEDLE_TABLE_LINE } from "@/lib/listing-needle";
import { listingPath } from "@/lib/paths";

export function ListingNeedleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-needle-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Stylus is in"
        title={NEEDLE_EMPTY_LINE}
        body={`${NEEDLE_TABLE_LINE} Tape it when the stylus walked. It does not drop the tote or mark it sold.`}
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
