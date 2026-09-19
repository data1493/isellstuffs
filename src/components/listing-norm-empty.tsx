import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { NORM_EMPTY_LINE, NORM_TABLE_LINE } from "@/lib/listing-norm";
import { listingPath } from "@/lib/paths";

export function ListingNormEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-norm-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still as recorded"
        title={NORM_EMPTY_LINE}
        body={`${NORM_TABLE_LINE} Tape it when walkers still want the kicks the same loud. It does not drop the tote or rewrite the file.`}
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
