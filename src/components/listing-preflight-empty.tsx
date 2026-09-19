import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  PREFLIGHT_EMPTY_LINE,
  PREFLIGHT_TABLE_LINE,
} from "@/lib/listing-preflight";
import { listingPath } from "@/lib/paths";

export function ListingPreflightEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-preflight-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Preflight not taped"
        title={PREFLIGHT_EMPTY_LINE}
        body={`${PREFLIGHT_TABLE_LINE} Tape it when walkers still want the copy-shop check. It does not drop the tote or rewrite the file.`}
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
