import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_VARIAC_EMPTY_COPY, BOOTH_VARIAC_PAPER_LINE } from "@/lib/booth-variac";
import { stallPath } from "@/lib/paths";

export function BoothVariacEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-variac-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a variac"
        title={BOOTH_VARIAC_EMPTY_COPY}
        body={`${BOOTH_VARIAC_PAPER_LINE} Nobody taped a variac note on ${boothName} in this browser. Still a driveway. Still no bench.`}
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
