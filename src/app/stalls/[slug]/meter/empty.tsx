import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_METER_EMPTY_COPY, BOOTH_METER_PAPER_LINE } from "@/lib/booth-meter";
import { stallPath } from "@/lib/paths";

export function BoothMeterEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-meter-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a meter"
        title={BOOTH_METER_EMPTY_COPY}
        body={`${BOOTH_METER_PAPER_LINE} Nobody taped a meter note on ${boothName} in this browser. Sold as a pile. Not a bench.`}
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
