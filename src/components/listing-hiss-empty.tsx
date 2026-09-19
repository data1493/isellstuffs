import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HISS_EMPTY_LINE, HISS_TABLE_LINE } from "@/lib/listing-hiss";
import { listingPath } from "@/lib/paths";

export function ListingHissEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hiss-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Leave the hiss"
        title={HISS_EMPTY_LINE}
        body={`${HISS_TABLE_LINE} Tape it when the tape already hisses. It does not drop the tote or rewrite the skip.`}
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
