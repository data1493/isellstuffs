import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CONSULT_EMPTY_LINE, CONSULT_TABLE_LINE } from "@/lib/listing-consult";
import { listingPath } from "@/lib/paths";

export function ListingConsultEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-consult-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still a rule of thumb"
        title={CONSULT_EMPTY_LINE}
        body={`${CONSULT_TABLE_LINE} Tape it when walkers still want a price on their pile. It does not drop the tote or rewrite the file.`}
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
