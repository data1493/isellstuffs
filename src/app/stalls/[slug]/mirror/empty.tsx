import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_MIRROR_EMPTY_COPY,
  BOOTH_MIRROR_PAPER_LINE,
} from "@/lib/booth-mirror";
import { stallPath } from "@/lib/paths";

export function BoothMirrorEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-mirror-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a mirror"
        title={BOOTH_MIRROR_EMPTY_COPY}
        body={`${BOOTH_MIRROR_PAPER_LINE} Nobody taped a mirror note on ${boothName} in this browser. Still a rack. Still no lookbook.`}
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
