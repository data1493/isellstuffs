import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CASES_EMPTY_LINE, CASES_TABLE_LINE } from "@/lib/listing-cases";
import { listingPath } from "@/lib/paths";

export function ListingCasesEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cases-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Discs still in it"
        title={CASES_EMPTY_LINE}
        body={`${CASES_TABLE_LINE} Tape it when the jewel case is empty. It does not drop the tote or mark a play count.`}
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
