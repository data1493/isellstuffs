import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { VERSO_EMPTY_LINE, VERSO_TABLE_LINE } from "@/lib/listing-verso";
import { listingPath } from "@/lib/paths";

export function ListingVersoEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-verso-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still one page"
        title={VERSO_EMPTY_LINE}
        body={`${VERSO_TABLE_LINE} Tape it when walkers still want a second page. It does not drop the tote or rewrite the file.`}
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
