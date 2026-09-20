import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_CALIPER_EMPTY_COPY,
  BOOTH_CALIPER_PAPER_LINE,
} from "@/lib/booth-caliper";
import { stallPath } from "@/lib/paths";

export function BoothCaliperEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-caliper-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a caliper"
        title={BOOTH_CALIPER_EMPTY_COPY}
        body={`${BOOTH_CALIPER_PAPER_LINE} Nobody taped a caliper note on ${boothName} in this browser. Still a crack. Still a stain.`}
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
