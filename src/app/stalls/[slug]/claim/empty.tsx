import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_CLAIM_EMPTY_COPY, BOOTH_CLAIM_PAPER_LINE } from "@/lib/booth-claim";
import { stallPath } from "@/lib/paths";

export function BoothClaimEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-claim-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't warranty"
        title={BOOTH_CLAIM_EMPTY_COPY}
        body={`${BOOTH_CLAIM_PAPER_LINE} Nobody taped a claim note on ${boothName} in this browser. Fix is no solder. Shell is the blister. Line stays. As-is is the register.`}
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
