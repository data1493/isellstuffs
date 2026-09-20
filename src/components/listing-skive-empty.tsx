import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SKIVE_EMPTY_LINE, SKIVE_TABLE_LINE } from "@/lib/listing-skive";
import { listingPath } from "@/lib/paths";

export function ListingSkiveEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-skive-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Skive not taped"
        title={SKIVE_EMPTY_LINE}
        body={`${SKIVE_TABLE_LINE} Tape it when walkers still want the peel skived. It does not drop the tote or mark it sold.`}
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
