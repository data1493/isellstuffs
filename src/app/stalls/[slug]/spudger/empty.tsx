import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_SPUDGER_EMPTY_COPY,
  BOOTH_SPUDGER_PAPER_LINE,
} from "@/lib/booth-spudger";
import { stallPath } from "@/lib/paths";

export function BoothSpudgerEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-spudger-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a spudger"
        title={BOOTH_SPUDGER_EMPTY_COPY}
        body={`${BOOTH_SPUDGER_PAPER_LINE} Nobody taped a spudger note on ${boothName} in this browser. Still a blister. Still fused.`}
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
