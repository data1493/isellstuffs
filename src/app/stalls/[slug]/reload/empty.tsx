import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_RELOAD_EMPTY_COPY,
  BOOTH_RELOAD_PAPER_LINE,
} from "@/lib/booth-reload";
import { stallPath } from "@/lib/paths";

export function BoothReloadEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-reload-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't reload"
        title={BOOTH_RELOAD_EMPTY_COPY}
        body={`${BOOTH_RELOAD_PAPER_LINE} Nobody taped a reload note on ${boothName} in this browser. Face value. Not a wallet.`}
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
