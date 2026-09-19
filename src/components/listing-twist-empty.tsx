import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TWIST_EMPTY_LINE, TWIST_TABLE_LINE } from "@/lib/listing-twist";
import { listingPath } from "@/lib/paths";

export function ListingTwistEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-twist-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Twist not taped"
        title={TWIST_EMPTY_LINE}
        body={`${TWIST_TABLE_LINE} Tape it when walkers want a new switch. It does not drop the tote or write crack.`}
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
