import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SKIP_EMPTY_LINE, SKIP_TABLE_LINE } from "@/lib/listing-skip";
import { listingPath } from "@/lib/paths";

export function ListingSkipEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-skip-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Leave the groove"
        title={SKIP_EMPTY_LINE}
        body={`${SKIP_TABLE_LINE} Tape it when Side A still skips. It does not drop the tote or rewrite the press.`}
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
