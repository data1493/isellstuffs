import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_FOIL_EMPTY_COPY,
  BOOTH_FOIL_PAPER_LINE,
} from "@/lib/booth-foil";
import { stallPath } from "@/lib/paths";

export function BoothFoilEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-foil-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have foil"
        title={BOOTH_FOIL_EMPTY_COPY}
        body={`${BOOTH_FOIL_PAPER_LINE} Nobody taped a foil note on ${boothName} in this browser. Drawer only. Still tote.`}
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
