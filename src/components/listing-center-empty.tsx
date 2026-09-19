import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CENTER_EMPTY_LINE, CENTER_TABLE_LINE } from "@/lib/listing-center";
import { listingPath } from "@/lib/paths";

export function ListingCenterEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-center-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Center not taped"
        title={CENTER_EMPTY_LINE}
        body={`${CENTER_TABLE_LINE} Tape it when walkers still want the hole true. It does not drop the tote or mark it sold.`}
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
