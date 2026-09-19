import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SIZE_EMPTY_LINE, SIZE_TABLE_LINE } from "@/lib/listing-size";
import { listingPath } from "@/lib/paths";

export function ListingSizeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-size-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Fits the tag"
        title={SIZE_EMPTY_LINE}
        body={`${SIZE_TABLE_LINE} Tape it when the sewn-in tag lied. It does not drop the tote or mark it sold.`}
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
