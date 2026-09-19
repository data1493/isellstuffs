import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SUBSET_EMPTY_LINE, SUBSET_TABLE_LINE } from "@/lib/listing-subset";
import { listingPath } from "@/lib/paths";

export function ListingSubsetEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-subset-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Subset not taped"
        title={SUBSET_EMPTY_LINE}
        body={`${SUBSET_TABLE_LINE} Tape it when walkers still want a webfont cut. It does not drop the tote or rewrite the file.`}
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
