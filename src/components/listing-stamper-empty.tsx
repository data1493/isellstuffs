import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { STAMPER_EMPTY_LINE, STAMPER_TABLE_LINE } from "@/lib/listing-stamper";
import { listingPath } from "@/lib/paths";

export function ListingStamperEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-stamper-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Stamper not taped"
        title={STAMPER_EMPTY_LINE}
        body={`${STAMPER_TABLE_LINE} Tape it when walkers still want a shop pressed father. It does not drop the tote or mark it sold.`}
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
