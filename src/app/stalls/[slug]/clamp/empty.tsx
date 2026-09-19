import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_CLAMP_EMPTY_COPY,
  BOOTH_CLAMP_PAPER_LINE,
} from "@/lib/booth-clamp";
import { stallPath } from "@/lib/paths";

export function BoothClampEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-clamp-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a clamp"
        title={BOOTH_CLAMP_EMPTY_COPY}
        body={`${BOOTH_CLAMP_PAPER_LINE} Nobody taped a clamp note on ${boothName} in this browser. Still a folding table.`}
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
