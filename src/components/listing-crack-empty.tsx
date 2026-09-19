import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CRACK_EMPTY_LINE, CRACK_TABLE_LINE } from "@/lib/listing-crack";
import { listingPath } from "@/lib/paths";

export function ListingCrackEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-crack-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Crack not taped"
        title={CRACK_EMPTY_LINE}
        body={`${CRACK_TABLE_LINE} Tape it when the ceramic base already has the crack. It does not drop the tote or mark it sold.`}
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
