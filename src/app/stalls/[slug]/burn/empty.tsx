import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_BURN_EMPTY_COPY, BOOTH_BURN_PAPER_LINE } from "@/lib/booth-burn";
import { stallPath } from "@/lib/paths";

export function BoothBurnEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-burn-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't burn a disc"
        title={BOOTH_BURN_EMPTY_COPY}
        body={`${BOOTH_BURN_PAPER_LINE} Nobody taped a burn note on ${boothName} in this browser. Stick is no email. Plays is this copy. The folder still delivers.`}
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
