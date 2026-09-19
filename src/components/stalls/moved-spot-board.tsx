import Link from "next/link";

import { MovedSpotEmpty } from "@/app/stalls/[slug]/spot/empty";
import { MovedSpotForm } from "@/components/stalls/moved-spot-form";
import { SyncMovedSpot } from "@/components/stalls/sync-moved-spot";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  MOVED_SPOT_EMPTY_TAPE,
  MOVED_SPOT_MIRROR_SCRIPT,
  MOVED_SPOT_PACKED_LEFTOVER,
  MOVED_SPOT_PAPER_LINE,
  type MovedSpotMap,
  type MovedSpotNote,
} from "@/lib/moved-spot";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function MovedSpotBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: MovedSpotMap;
  current?: MovedSpotNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: MOVED_SPOT_MIRROR_SCRIPT }} />
      <SyncMovedSpot map={map} />

      <MallHero>
        <MallCrumb label="Moved two spots">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Gravel</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a new stall
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not new hours
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Moved two spots</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The truck took the dirt.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {MOVED_SPOT_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still go to last week’s spot unless you tape the gravel.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The gravel note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                Where did the table go?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Two spots toward the pavilion.
                Same folding table. Clear deletes this booth only.
              </p>
            </div>
            <MovedSpotForm
              stallId={stall.id}
              slug={stall.slug}
              current={current}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              The stall is still{" "}
              <Link
                href={stallPath(stall.slug)}
                className="underline underline-offset-4"
              >
                {stall.boothName}
              </Link>
              . The lot still says who set up. This note does not open a
              seventh stall or rewrite Saturday hours.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank gravel note"
                title={MOVED_SPOT_EMPTY_TAPE}
                body="Empty tape does not stick. Write where you moved — two spots toward the pavilion — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Moved two spots."
                body={
                  <div className="space-y-3">
                    <p data-moved-spot-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-moved-spot-leftover="">{MOVED_SPOT_PACKED_LEFTOVER}</p>
                    ) : null}
                  </div>
                }
              >
                <p className="text-sm text-muted-foreground">
                  <Link
                    href={lotPath()}
                    className="underline underline-offset-4"
                  >
                    See the lot
                  </Link>
                </p>
              </MallNotice>
            ) : emptyTape ? null : (
              <MovedSpotEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
