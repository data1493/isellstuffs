import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DRESS_EMPTY_LINE, DRESS_TABLE_LINE } from "@/lib/listing-dress";
import { listingPath } from "@/lib/paths";

export function ListingDressEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dress-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dress not taped"
        title={DRESS_EMPTY_LINE}
        body={`${DRESS_TABLE_LINE} Tape it when walkers still want a shop dress of the stone. It does not drop the tote or mark it sold.`}
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
