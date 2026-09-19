import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOX_EMPTY_LINE, BOX_TABLE_LINE } from "@/lib/listing-box";
import { listingPath } from "@/lib/paths";

export function ListingBoxEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-box-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Shade not boxed"
        title={BOX_EMPTY_LINE}
        body={`${BOX_TABLE_LINE} Tape it when the lamp shade stays packed separately. It does not drop the tote or mark it sold.`}
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
