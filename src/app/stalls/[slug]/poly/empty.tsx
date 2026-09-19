import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_POLY_EMPTY_COPY, BOOTH_POLY_PAPER_LINE } from "@/lib/booth-poly";
import { stallPath } from "@/lib/paths";

export function BoothPolyEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-poly-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Keep the poly on"
        title={BOOTH_POLY_EMPTY_COPY}
        body={`${BOOTH_POLY_PAPER_LINE} Nobody taped a poly note on ${boothName} in this browser. Ask is still one sleeve.`}
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
