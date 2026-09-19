import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TOE_EMPTY_LINE, TOE_TABLE_LINE } from "@/lib/listing-toe";
import { listingPath } from "@/lib/paths";

export function ListingToeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-toe-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Sole is still glued"
        title={TOE_EMPTY_LINE}
        body={`${TOE_TABLE_LINE} Tape it when the sole already peeled. It does not drop the tote or rewrite the laces.`}
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
