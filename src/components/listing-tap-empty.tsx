import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TAP_EMPTY_LINE, TAP_TABLE_LINE } from "@/lib/listing-tap";
import { listingPath } from "@/lib/paths";

export function ListingTapEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-tap-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Tap not taped"
        title={TAP_EMPTY_LINE}
        body={`${TAP_TABLE_LINE} Tape it when walkers still want the threads cut. It does not drop the tote or mark it sold.`}
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
