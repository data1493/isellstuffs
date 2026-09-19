import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_PLAYER_EMPTY_COPY,
  BOOTH_PLAYER_PAPER_LINE,
} from "@/lib/booth-player";
import { stallPath } from "@/lib/paths";

export function BoothPlayerEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-player-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a player"
        title={BOOTH_PLAYER_EMPTY_COPY}
        body={`${BOOTH_PLAYER_PAPER_LINE} Nobody taped a player note on ${boothName} in this browser. Still Sharpie. Still a table.`}
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
