import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PAD_EMPTY_LINE, PAD_TABLE_LINE } from "@/lib/listing-pad";
import { listingPath } from "@/lib/paths";

export function ListingPadEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pad-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pad not taped"
        title={PAD_EMPTY_LINE}
        body={`${PAD_TABLE_LINE} Tape it when walkers still want pads thrown in. It does not drop the tote or mark it sold.`}
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
