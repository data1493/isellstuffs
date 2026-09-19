import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RIGHTS_EMPTY_LINE, RIGHTS_TABLE_LINE } from "@/lib/listing-rights";
import { listingPath } from "@/lib/paths";

export function ListingRightsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-rights-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still as recorded"
        title={RIGHTS_EMPTY_LINE}
        body={`${RIGHTS_TABLE_LINE} Tape it when walkers still want a license on the kicks. It does not drop the tote or rewrite the file.`}
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
