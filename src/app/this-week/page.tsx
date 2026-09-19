import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { MallPickBadge } from "@/components/this-week/mall-pick-badge";
import { WeekPickCard } from "@/components/this-week/week-pick-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/commerce";
import { listingPath, thisWeekEditPath } from "@/lib/paths";
import { thisWeekMetadata } from "@/lib/seo";
import {
  resolveWeekPickIds,
  WEEK_PICKS_COOKIE_NAME,
  WEEK_PICKS_STORAGE_KEY,
} from "@/lib/week-overlay";
import {
  thisWeekMix,
  thisWeekPicks,
  thisWeekWindow,
  type WeekPick,
} from "@/lib/week-pick";
import {
  appendWeekendPins,
  WEEKEND_PINS_COOKIE_NAME,
  WEEKEND_PINS_STORAGE_KEY,
} from "@/lib/weekend-table-pin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = thisWeekMetadata();

const syncScript = `try{var m=document.cookie.match(/(?:^|; )${WEEK_PICKS_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(WEEK_PICKS_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}try{var p=document.cookie.match(/(?:^|; )${WEEKEND_PINS_COOKIE_NAME}=([^;]*)/);if(p){localStorage.setItem(${JSON.stringify(WEEKEND_PINS_STORAGE_KEY)},decodeURIComponent(p[1]));}}catch(e){}`;

export default async function ThisWeekPage() {
  const jar = await cookies();
  const { ids, fromOverlay } = resolveWeekPickIds(
    jar.get(WEEK_PICKS_COOKIE_NAME)?.value,
  );
  const picks = thisWeekPicks(
    appendWeekendPins(ids, jar.get(WEEKEND_PINS_COOKIE_NAME)?.value),
  );
  const mix = thisWeekMix(picks);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: syncScript }} />
      {picks.length === 0 ? (
        <ThisWeekEmpty fromOverlay={fromOverlay} />
      ) : (
        <ThisWeekTable picks={picks} mix={mix} fromOverlay={fromOverlay} />
      )}
    </>
  );
}

function ThisWeekEmpty({ fromOverlay }: { fromOverlay: boolean }) {
  return (
    <MallNotice
      tone="empty"
      eyebrow="Weekend table"
      title="Nothing taped down this weekend."
      body={
        fromOverlay
          ? "This browser's overlay is empty. Sold and file-gone do not get a second life here. Tape a few stand-in SKUs, or walk the concourse."
          : "The mall pick list is empty. Sold and file-gone do not get a second life here. Walk the concourse for what is still on the floor."
      }
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={thisWeekEditPath()} />}
          >
            Tape the weekend table
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Explore the concourse
          </Button>
        </>
      }
    />
  );
}

function ThisWeekTable({
  picks,
  mix,
  fromOverlay,
}: {
  picks: WeekPick[];
  mix: { physical: number; digital: number };
  fromOverlay: boolean;
}) {
  return (
    <div>
      <MallHero>
        <MallCrumb label="This week">
          <CrumbSep />
          <span className="text-foreground">This week</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <MallPickBadge />
          <Badge variant="outline" className="rounded-full">
            {thisWeekWindow}
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            Not a paid stamp
          </Badge>
          {fromOverlay ? (
            <Badge variant="outline" className="rounded-full">
              Local table
            </Badge>
          ) : null}
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            On the table this weekend.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            A folding-table drop. A few things the mall would actually put in
            your hands — objects and files, same weekend, no stamp, no
            newsletter.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {mix.physical} {mix.physical === 1 ? "thing you can hold" : "things you can hold"}
          {" · "}
          {mix.digital} {mix.digital === 1 ? "file" : "files"}
        </p>
      </MallHero>

      <MallSection>
        <div className="max-w-2xl">
          <MallEyebrow>The drop</MallEyebrow>
          <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
            {picks.length} {picks.length === 1 ? "tag" : "tags"}. One table.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Titles and prices come from the stalls. The tape is ours. If it
            sold or the file walked, it does not sit here.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {picks.map((pick) => (
            <li key={pick.listing.id} className="min-w-0">
              <WeekPickCard pick={pick} />
            </li>
          ))}
        </ol>
      </MallSection>

      <MallSection className="border-t border-border bg-card/60">
        <MallEyebrow>Take a tag</MallEyebrow>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {picks.map((pick) => (
            <li key={`slip-${pick.listing.id}`}>
              <Link
                href={listingPath(pick.listing.id)}
                className="flex items-baseline justify-between gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm hover:border-foreground/30"
              >
                <span className="min-w-0 truncate font-medium">
                  {pick.listing.title}
                </span>
                <span className="shrink-0 font-heading">
                  {formatMoney(pick.listing.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            className="rounded-full px-5"
            render={<Link href={thisWeekEditPath()} />}
          >
            Tape a different table
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Walk the rest of the floor
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/hubs" />}
          >
            Pick a hub
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
