import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_SPONGE_EMPTY_COPY,
  BOOTH_SPONGE_PAPER_LINE,
} from "@/lib/booth-sponge";
import { stallPath } from "@/lib/paths";

export function BoothSpongeEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-sponge-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a sponge"
        title={BOOTH_SPONGE_EMPTY_COPY}
        body={`${BOOTH_SPONGE_PAPER_LINE} Nobody taped a sponge note on ${boothName} in this browser. Still dishes. Still a hose.`}
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
