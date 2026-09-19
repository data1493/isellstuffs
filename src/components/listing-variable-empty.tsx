import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  VARIABLE_EMPTY_LINE,
  VARIABLE_TABLE_LINE,
} from "@/lib/listing-variable";
import { listingPath } from "@/lib/paths";

export function ListingVariableEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-variable-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Variable not taped"
        title={VARIABLE_EMPTY_LINE}
        body={`${VARIABLE_TABLE_LINE} Tape it when walkers still want the axes interpolated. It does not drop the tote or rewrite the file.`}
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
