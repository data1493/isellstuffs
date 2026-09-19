import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_SLIPMAT_EMPTY_COPY,
  BOOTH_SLIPMAT_PAPER_LINE,
} from "@/lib/booth-slipmat";
import { stallPath } from "@/lib/paths";

export function BoothSlipmatEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-slipmat-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a slipmat"
        title={BOOTH_SLIPMAT_EMPTY_COPY}
        body={`${BOOTH_SLIPMAT_PAPER_LINE} Nobody taped a slipmat note on ${boothName} in this browser. Still a crate. Still no deck.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={stallPath(slug)} />}
          >
            Back to the stall
          </Button>
        }
      />
    </div>
  );
}
