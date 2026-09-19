import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_SHRINK_EMPTY_COPY, BOOTH_SHRINK_PAPER_LINE } from "@/lib/booth-shrink";
import { stallPath } from "@/lib/paths";

export function BoothShrinkEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-shrink-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't shrink-wrap"
        title={BOOTH_SHRINK_EMPTY_COPY}
        body={`${BOOTH_SHRINK_PAPER_LINE} Nobody taped a shrink note on ${boothName} in this browser. Poly is keep-on. Wrap is newspaper.`}
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
