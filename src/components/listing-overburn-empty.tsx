import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { OVERBURN_EMPTY_LINE, OVERBURN_TABLE_LINE } from "@/lib/listing-overburn";
import { listingPath } from "@/lib/paths";

export function ListingOverburnEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-overburn-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Overburn not taped"
        title={OVERBURN_EMPTY_LINE}
        body={`${OVERBURN_TABLE_LINE} Tape it when walkers still want extra minutes past the lead-out. It does not drop the tote or mark it sold.`}
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
