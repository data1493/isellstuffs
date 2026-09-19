import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PHONE_EMPTY_LINE, PHONE_TABLE_LINE } from "@/lib/listing-phone";
import { listingPath } from "@/lib/paths";

export function ListingPhoneEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-phone-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Phone not taped"
        title={PHONE_EMPTY_LINE}
        body={`${PHONE_TABLE_LINE} Tape it when walkers still ask if the brick fits. It does not drop the tote or mark it sold.`}
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
