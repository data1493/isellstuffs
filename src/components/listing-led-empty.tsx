import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LED_EMPTY_LINE, LED_TABLE_LINE } from "@/lib/listing-led";
import { listingPath } from "@/lib/paths";

export function ListingLedEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-led-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Led not taped"
        title={LED_EMPTY_LINE}
        body={`${LED_TABLE_LINE} Tape it when walkers still want an LED swap. It does not drop the tote or mark it sold.`}
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
