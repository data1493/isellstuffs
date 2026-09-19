import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BEVEL_EMPTY_LINE, BEVEL_TABLE_LINE } from "@/lib/listing-bevel";
import { listingPath } from "@/lib/paths";

export function ListingBevelEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bevel-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Bevel not taped"
        title={BEVEL_EMPTY_LINE}
        body={`${BEVEL_TABLE_LINE} Tape it when walkers still want the outer dressed so it doesn’t catch the tray. It does not drop the tote or mark it sold.`}
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
