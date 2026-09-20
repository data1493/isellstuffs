import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_DRIFT_EMPTY_COPY,
  BOOTH_DRIFT_PAPER_LINE,
} from "@/lib/booth-drift";
import { stallPath } from "@/lib/paths";

export function BoothDriftEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-drift-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a drift"
        title={BOOTH_DRIFT_EMPTY_COPY}
        body={`${BOOTH_DRIFT_PAPER_LINE} Nobody taped a drift note on ${boothName} in this browser. Still a driveway.`}
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
