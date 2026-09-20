import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DESCREEN_EMPTY_LINE, DESCREEN_TABLE_LINE } from "@/lib/listing-descreen";
import { listingPath } from "@/lib/paths";

export function ListingDescreenEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-descreen-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Descreen not taped"
        title={DESCREEN_EMPTY_LINE}
        body={`${DESCREEN_TABLE_LINE} Tape it when walkers still want the print dots pulled. It does not drop the tote or rewrite the file. Pull the dots, not a login.`}
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
