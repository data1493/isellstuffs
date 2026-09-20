import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BLEED_EMPTY_LINE, BLEED_TABLE_LINE } from "@/lib/listing-bleed";
import { listingPath } from "@/lib/paths";

export function ListingBleedEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bleed-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Bleed not taped"
        title={BLEED_EMPTY_LINE}
        body={`${BLEED_TABLE_LINE} Tape it when walkers still want the copy-shop trim. It does not drop the tote or rewrite the file.`}
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
