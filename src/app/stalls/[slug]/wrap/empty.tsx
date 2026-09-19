import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_WRAP_EMPTY_COPY, BOOTH_WRAP_PAPER_LINE } from "@/lib/booth-wrap";
import { stallPath } from "@/lib/paths";

export function BoothWrapEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-wrap-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I wrap breakables"
        title={BOOTH_WRAP_EMPTY_COPY}
        body={`${BOOTH_WRAP_PAPER_LINE} Nobody taped wrap paper on ${boothName} in this browser. The yard sign is still no-ship.`}
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
