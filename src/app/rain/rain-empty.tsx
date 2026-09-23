import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sellRainPath, stallPath, walkPath } from "@/lib/paths";

export function RainEmpty() {
  return (
    <div data-rain-empty="">
      <MallHero>
        <MallCrumb label="Rain Sunday">
          <CrumbSep />
          <span className="text-foreground">Rain Sunday</span>
        </MallCrumb>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            If Saturday is wet
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not this weekend’s hours
          </Badge>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Rain Sunday
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Booths that taped a Sunday card. Same driveway if Saturday is wet.
            Hours on the lamp stay Saturday.
          </p>
        </div>
      </MallHero>
      <MallWidth className="flex flex-col gap-6 py-12 sm:py-16">
        <MallNotice
          padded={false}
          tone="empty"
          eyebrow="Rain Sunday"
          title="Nobody taped a rain date."
          body="Saturday still stands. A stallholder can tape Sunday on the rain desk if the driveway needs a wet-weather card."
          actions={
            <>
              <Button
                className="rounded-full px-5"
                render={<Link href={sellRainPath()} />}
              >
                Tape Tuesday’s rain date
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-5"
                render={<Link href={stallPath("folding-table-tuesday")} />}
              >
                Open Folding Table Tuesday
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-5"
                render={<Link href={walkPath()} />}
              >
                Saturday walk
              </Button>
            </>
          }
        />
      </MallWidth>
    </div>
  );
}
