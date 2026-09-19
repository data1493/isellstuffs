import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { lotPath, stallPath, watchedPath } from "@/lib/paths";
import type { WalkStop } from "@/lib/walk-sheet";

export function WalkStops({
  stops,
  packedAwayCount,
}: {
  stops: WalkStop[];
  packedAwayCount: number;
}) {
  return (
    <div data-walk-sheet="">
      <MallHero>
        <MallCrumb label="Saturday morning walk">
          <CrumbSep />
          <span className="text-foreground">Saturday walk</span>
        </MallCrumb>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            This Saturday
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {`${stops.length} ${stops.length === 1 ? "stop" : "stops"}`}
          </Badge>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Saturday morning walk
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Tables you marked. Hours for this weekend. Packed booths stay in
            the car.
          </p>
        </div>
        {packedAwayCount > 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {packedAwayCount === 1
              ? "One watched table packed up. It stays off this scrap."
              : `${packedAwayCount} watched tables packed up. They stay off this scrap.`}
          </p>
        ) : null}
      </MallHero>

      <MallWidth className="flex flex-col gap-8 py-12 sm:py-16">
        <ol className="space-y-4">
          {stops.map(({ stall, pickup }) => (
            <li
              key={stall.id}
              data-walk-stall={stall.id}
              className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  Still out
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
                data-walk-hours=""
                className="mt-4 font-heading text-lg tracking-tight"
              >
                {pickup.hours}
              </p>
              <p
                data-walk-place=""
                className="mt-1 text-sm leading-6 text-foreground"
              >
                {pickup.place}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {pickup.note}
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
          Mark more tables on{" "}
          <Link href={watchedPath()} className="underline-offset-4 hover:underline">
            watched tables
          </Link>
          . Who came is on{" "}
          <Link href={lotPath()} className="underline-offset-4 hover:underline">
            the lot
          </Link>
          .
        </p>
      </MallWidth>
    </div>
  );
}
