import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { KEY_EMPTY_LINE, KEY_TABLE_LINE } from "@/lib/listing-key";
import { listingPath } from "@/lib/paths";

export function ListingKeyEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-key-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Key is in"
        title={KEY_EMPTY_LINE}
        body={`${KEY_TABLE_LINE} Tape it when the cabinet key walked. It does not drop the tote or mark it sold.`}
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
