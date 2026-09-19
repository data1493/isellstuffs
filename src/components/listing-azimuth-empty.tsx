import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { AZIMUTH_EMPTY_LINE, AZIMUTH_TABLE_LINE } from "@/lib/listing-azimuth";
import { listingPath } from "@/lib/paths";

export function ListingAzimuthEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-azimuth-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Azimuth not taped"
        title={AZIMUTH_EMPTY_LINE}
        body={`${AZIMUTH_TABLE_LINE} Tape it when walkers still want the heading set. It does not drop the tote or mark it sold.`}
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
