import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WASH_EMPTY_LINE, WASH_TABLE_LINE } from "@/lib/listing-wash";
import { listingPath } from "@/lib/paths";

export function ListingWashEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-wash-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still a car smell"
        title={WASH_EMPTY_LINE}
        body={`${WASH_TABLE_LINE} Tape it when the jacket went through a machine. It does not drop the tote or rewrite the size tag.`}
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
