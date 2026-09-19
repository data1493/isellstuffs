import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BENT_EMPTY_LINE, BENT_TABLE_LINE } from "@/lib/listing-bent";
import { listingPath } from "@/lib/paths";

export function ListingBentEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bent-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still a balloon"
        title={BENT_EMPTY_LINE}
        body={`${BENT_TABLE_LINE} Tape it when the wires splay. It does not drop the tote or heat a mug.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
