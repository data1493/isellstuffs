import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { STRAP_EMPTY_LINE, STRAP_TABLE_LINE } from "@/lib/listing-strap";
import { listingPath } from "@/lib/paths";

export function ListingStrapEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-strap-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Strap is in"
        title={STRAP_EMPTY_LINE}
        body={`${STRAP_TABLE_LINE} Tape it when the camera/bag strap walked. It does not drop the tote or mark it sold.`}
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
