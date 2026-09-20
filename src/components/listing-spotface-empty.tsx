import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SPOTFACE_EMPTY_LINE, SPOTFACE_TABLE_LINE } from "@/lib/listing-spotface";
import { listingPath } from "@/lib/paths";

export function ListingSpotfaceEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-spotface-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Spotface not taped"
        title={SPOTFACE_EMPTY_LINE}
        body={`${SPOTFACE_TABLE_LINE} Tape it when walkers still want a shop flat around the hole. It does not drop the tote or mark it sold.`}
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
