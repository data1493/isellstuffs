import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_COVER_EMPTY_COPY,
  BOOTH_COVER_PAPER_LINE,
} from "@/lib/booth-cover";
import { stallPath } from "@/lib/paths";

export function BoothCoverEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-cover-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Neighbor is sitting"
        title={BOOTH_COVER_EMPTY_COPY}
        body={`${BOOTH_COVER_PAPER_LINE} Nobody taped a sitter on ${boothName} in this browser.`}
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
