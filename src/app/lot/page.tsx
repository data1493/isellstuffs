import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { LotEmpty } from "@/app/lot/empty";
import { LotBoothCard } from "@/components/lot/lot-booth-card";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BACK_SOON_COOKIE_NAME,
  BACK_SOON_MIRROR_SCRIPT,
  parseBackSoon,
} from "@/lib/back-soon";
import {
  BOOTH_COVER_COOKIE_NAME,
  BOOTH_COVER_MIRROR_SCRIPT,
  coverSitterFor,
  parseBoothCover,
} from "@/lib/booth-cover";
import {
  BOOTH_FILM_COOKIE_NAME,
  BOOTH_FILM_MIRROR_SCRIPT,
  parseBoothFilm,
} from "@/lib/booth-film";
import {
  BOOTH_KIDS_COOKIE_NAME,
  BOOTH_KIDS_MIRROR_SCRIPT,
  parseBoothKids,
} from "@/lib/booth-kids";
import {
  BOOTH_WRAP_COOKIE_NAME,
  BOOTH_WRAP_MIRROR_SCRIPT,
  parseBoothWrap,
} from "@/lib/booth-wrap";
import {
  BOOTH_SHADE_COOKIE_NAME,
  BOOTH_SHADE_MIRROR_SCRIPT,
  parseBoothShade,
} from "@/lib/booth-shade";
import {
  BOOTH_STAY_COOKIE_NAME,
  BOOTH_STAY_MIRROR_SCRIPT,
  parseBoothStay,
} from "@/lib/booth-stay";
import {
  BREAK_BILLS_COOKIE_NAME,
  BREAK_BILLS_MIRROR_SCRIPT,
  parseBreakBills,
} from "@/lib/break-bills";
import {
  EARLY_FOLD_COOKIE_NAME,
  EARLY_FOLD_MIRROR_SCRIPT,
  parseEarlyFold,
} from "@/lib/early-fold";
import {
  TABLE_SHARE_COOKIE_NAME,
  TABLE_SHARE_MIRROR_SCRIPT,
  parseTableShare,
  sharePartnerFor,
} from "@/lib/table-share";
import {
  MOVED_SPOT_COOKIE_NAME,
  MOVED_SPOT_MIRROR_SCRIPT,
  parseMovedSpot,
} from "@/lib/moved-spot";
import { PACKED_COOKIE_NAME, PACKED_MIRROR_SCRIPT } from "@/lib/packed-stall";
import { lotBoard, lotOff, lotOn } from "@/lib/lot-board";
import { lotPath, thisWeekPath } from "@/lib/paths";
import { lotMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = lotMetadata();

export default async function LotPage() {
  const jar = await cookies();
  const rows = lotBoard(jar.get(PACKED_COOKIE_NAME)?.value);
  const lunchMap = parseBackSoon(jar.get(BACK_SOON_COOKIE_NAME)?.value);
  const spotMap = parseMovedSpot(jar.get(MOVED_SPOT_COOKIE_NAME)?.value);
  const coverMap = parseBoothCover(jar.get(BOOTH_COVER_COOKIE_NAME)?.value);
  const foldMap = parseEarlyFold(jar.get(EARLY_FOLD_COOKIE_NAME)?.value);
  const breakMap = parseBreakBills(jar.get(BREAK_BILLS_COOKIE_NAME)?.value);
  const shareMap = parseTableShare(jar.get(TABLE_SHARE_COOKIE_NAME)?.value);
  const stayMap = parseBoothStay(jar.get(BOOTH_STAY_COOKIE_NAME)?.value);
  const shadeMap = parseBoothShade(jar.get(BOOTH_SHADE_COOKIE_NAME)?.value);
  const filmMap = parseBoothFilm(jar.get(BOOTH_FILM_COOKIE_NAME)?.value);
  const kidsMap = parseBoothKids(jar.get(BOOTH_KIDS_COOKIE_NAME)?.value);
  const wrapMap = parseBoothWrap(jar.get(BOOTH_WRAP_COOKIE_NAME)?.value);
  const on = lotOn(rows);
  const off = lotOff(rows);

  if (rows.length === 0) {
    return (
      <>
        <script dangerouslySetInnerHTML={{ __html: PACKED_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BACK_SOON_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: MOVED_SPOT_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_COVER_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: EARLY_FOLD_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BREAK_BILLS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: TABLE_SHARE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_STAY_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_SHADE_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_FILM_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_KIDS_MIRROR_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOTH_WRAP_MIRROR_SCRIPT }} />
        <LotEmpty />
      </>
    );
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PACKED_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BACK_SOON_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: MOVED_SPOT_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_COVER_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: EARLY_FOLD_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BREAK_BILLS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: TABLE_SHARE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STAY_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SHADE_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FILM_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_KIDS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: BOOTH_WRAP_MIRROR_SCRIPT }} />
      <div>
        <MallHero>
          <MallCrumb label="Lot location">
            <CrumbSep />
            <span className="text-foreground">Who set up</span>
          </MallCrumb>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              This weekend
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Not a lookbook
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Not this week&apos;s picks
            </Badge>
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
              Who set up.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              The lot map. Which folding tables came, which went in the car.
              Not a lookbook. Not this week&apos;s picks.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {on.length} {on.length === 1 ? "booth" : "booths"} on the lot
            {off.length > 0
              ? ` · ${off.length} ${off.length === 1 ? "booth" : "booths"} off the lot`
              : null}
          </p>
        </MallHero>

        <MallSection>
          <div className="max-w-2xl">
            <MallEyebrow>On the lot</MallEyebrow>
            <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
              Tables that came.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Still-here is a count, not a grid of lamps. Open the stall if you
              want the junk.
            </p>
          </div>

          {on.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Every table went in the car. Files in the folder still exist.
            </p>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {on.map((row) => (
                <li key={row.stall.id} className="min-w-0">
                  <LotBoothCard
                    row={row}
                    lunchNote={lunchMap[row.stall.id]?.note}
                    spotNote={spotMap[row.stall.id]?.note}
                    sitterName={coverSitterFor(row.stall.id, coverMap)?.boothName}
                    foldNote={foldMap[row.stall.id]?.note}
                    breakNote={breakMap[row.stall.id]?.note}
                    sharerName={sharePartnerFor(row.stall.id, shareMap)?.boothName}
                    stayNote={stayMap[row.stall.id]?.note}
                    shadeNote={shadeMap[row.stall.id]?.note}
                    filmNote={filmMap[row.stall.id]?.note}
                    kidsNote={kidsMap[row.stall.id]?.note}
                    wrapNote={wrapMap[row.stall.id]?.note}
                  />
                </li>
              ))}
            </ul>
          )}
        </MallSection>

        {off.length > 0 ? (
          <MallSection className="border-t border-border bg-card/60">
            <div className="max-w-2xl">
              <MallEyebrow>Off the lot</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
                In the car.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Packed for the week. Not a sold sticker. Not a refund.
              </p>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {off.map((row) => (
                <li key={row.stall.id} className="min-w-0">
                  <LotBoothCard
                    row={row}
                    lunchNote={lunchMap[row.stall.id]?.note}
                    spotNote={spotMap[row.stall.id]?.note}
                    sitterName={coverSitterFor(row.stall.id, coverMap)?.boothName}
                    foldNote={foldMap[row.stall.id]?.note}
                    breakNote={breakMap[row.stall.id]?.note}
                    sharerName={sharePartnerFor(row.stall.id, shareMap)?.boothName}
                    stayNote={stayMap[row.stall.id]?.note}
                    shadeNote={shadeMap[row.stall.id]?.note}
                    filmNote={filmMap[row.stall.id]?.note}
                    kidsNote={kidsMap[row.stall.id]?.note}
                    wrapNote={wrapMap[row.stall.id]?.note}
                  />
                </li>
              ))}
            </ul>
          </MallSection>
        ) : null}

        <MallSection className="border-t border-border bg-card/60">
          <MallEyebrow>Not this map</MallEyebrow>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Explore is still the concourse. This week is an editorial rack.
            The lot is who came.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/explore" />}
            >
              Walk the concourse
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={thisWeekPath()} />}
            >
              This week&apos;s picks
            </Button>
            <Button
              className="rounded-full px-5"
              render={<Link href={lotPath()} />}
            >
              Stay on the lot
            </Button>
          </div>
        </MallSection>
      </div>
    </>
  );
}
