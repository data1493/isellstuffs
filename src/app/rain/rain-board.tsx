import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import type { RainDateRow } from "@/lib/rain-date";
import { sellRainPath, stallPath, walkPath } from "@/lib/paths";

export function RainBoard({ rows }: { rows: RainDateRow[] }) {
  return (
    <div data-rain-board="">
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
            {`${rows.length} ${rows.length === 1 ? "booth" : "booths"}`}
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

      <MallWidth className="flex flex-col gap-8 py-12 sm:py-16">
        <ol className="grid gap-4 sm:grid-cols-2">
          {rows.map(({ stall, tape }) => (
            <li
              key={stall.id}
              data-rain-stall={stall.id}
              className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  Sunday if wet
                </Badge>
              </div>
              <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight">
                <Link
                  href={stallPath(stall.slug)}
                  className="underline-offset-4 hover:underline"
                >
                  {stall.boothName}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {stall.blurb}
              </p>
              <p
                data-rain-hours=""
                className="mt-4 font-heading text-lg tracking-tight"
              >
                {tape.hours}
              </p>
              <p
                data-rain-place=""
                className="mt-1 text-sm leading-6 text-foreground"
              >
                {tape.place}
              </p>
              <p
                data-rain-note=""
                className="mt-2 text-sm leading-6 text-muted-foreground"
              >
                {tape.note}
              </p>
              <p className="mt-5">
                <Link
                  href={stallPath(stall.slug)}
                  className="text-sm underline-offset-4 hover:underline"
                >
                  Open the stall
                </Link>
              </p>
            </li>
          ))}
        </ol>
        <p className="text-sm leading-6 text-muted-foreground">
          Tape another booth on{" "}
          <Link href={sellRainPath()} className="underline-offset-4 hover:underline">
            the rain desk
          </Link>
          . Saturday hours stay on{" "}
          <Link href={walkPath()} className="underline-offset-4 hover:underline">
            the Saturday walk
          </Link>
          .
        </p>
      </MallWidth>
    </div>
  );
}
