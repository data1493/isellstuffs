import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_TRIVET_EMPTY_COPY,
  BOOTH_TRIVET_PAPER_LINE,
} from "@/lib/booth-trivet";
import { stallPath } from "@/lib/paths";

export function BoothTrivetEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-trivet-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a trivet"
        title={BOOTH_TRIVET_EMPTY_COPY}
        body={`${BOOTH_TRIVET_PAPER_LINE} Nobody taped a trivet note on ${boothName} in this browser. Still a drawer. Still a chip.`}
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
