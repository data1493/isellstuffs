import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FOUNDRY_EMPTY_LINE, FOUNDRY_TABLE_LINE } from "@/lib/listing-foundry";
import { listingPath } from "@/lib/paths";

export function ListingFoundryEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-foundry-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The file"
        title={FOUNDRY_EMPTY_LINE}
        body={`${FOUNDRY_TABLE_LINE} Tape it when walkers ask for a foundry seat. It does not drop the tote or rewrite the file.`}
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
