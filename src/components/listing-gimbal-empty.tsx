import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GIMBAL_EMPTY_LINE, GIMBAL_TABLE_LINE } from "@/lib/listing-gimbal";
import { listingPath } from "@/lib/paths";

export function ListingGimbalEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gimbal-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gimbal not taped"
        title={GIMBAL_EMPTY_LINE}
        body={`${GIMBAL_TABLE_LINE} Tape it when walkers still want shop gimbal bearings. It does not drop the tote or mark it sold.`}
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
