import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_WAND_EMPTY_COPY, BOOTH_WAND_PAPER_LINE } from "@/lib/booth-wand";
import { stallPath } from "@/lib/paths";

export function BoothWandEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-wand-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a wand"
        title={BOOTH_WAND_EMPTY_COPY}
        body={`${BOOTH_WAND_PAPER_LINE} Nobody taped a wand note on ${boothName} in this browser. Still a crate. Still a skip.`}
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
