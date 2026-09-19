import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_FIX_EMPTY_COPY, BOOTH_FIX_PAPER_LINE } from "@/lib/booth-fix";
import { stallPath } from "@/lib/paths";

export function BoothFixEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-fix-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't fix"
        title={BOOTH_FIX_EMPTY_COPY}
        body={`${BOOTH_FIX_PAPER_LINE} Nobody taped a no-repair note on ${boothName} in this browser. Parts and remote stay their own paper.`}
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
