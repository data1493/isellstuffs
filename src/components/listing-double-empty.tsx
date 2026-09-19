import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DOUBLE_EMPTY_LINE, DOUBLE_TABLE_LINE } from "@/lib/listing-double";
import { listingPath } from "@/lib/paths";

export function ListingDoubleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-double-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Three cards still three"
        title={DOUBLE_EMPTY_LINE}
        body={`${DOUBLE_TABLE_LINE} Tape it when walkers still want the cards scaled for a crowd. It does not drop the tote or rewrite the file.`}
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
