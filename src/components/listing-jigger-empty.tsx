import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { JIGGER_EMPTY_LINE, JIGGER_TABLE_LINE } from "@/lib/listing-jigger";
import { listingPath } from "@/lib/paths";

export function ListingJiggerEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-jigger-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Jigger not taped"
        title={JIGGER_EMPTY_LINE}
        body={`${JIGGER_TABLE_LINE} Tape it when walkers still want a shop throwing wheel. It does not drop the tote or mark it sold.`}
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
