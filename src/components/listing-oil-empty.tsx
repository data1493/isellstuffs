import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { OIL_EMPTY_LINE, OIL_TABLE_LINE } from "@/lib/listing-oil";
import { listingPath } from "@/lib/paths";

export function ListingOilEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-oil-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="No oil tape"
        title={OIL_EMPTY_LINE}
        body={`${OIL_TABLE_LINE} Tape it when the kitchen tool already squeaks. It does not drop the tote or mark it sold.`}
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
