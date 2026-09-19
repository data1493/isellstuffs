import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_STICK_EMPTY_COPY, BOOTH_STICK_PAPER_LINE } from "@/lib/booth-stick";
import { stallPath } from "@/lib/paths";

export function BoothStickEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-stick-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't email the zip"
        title={BOOTH_STICK_EMPTY_COPY}
        body={`${BOOTH_STICK_PAPER_LINE} Nobody taped a zip note on ${boothName} in this browser. Plays stays the disc. The folder still delivers.`}
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
