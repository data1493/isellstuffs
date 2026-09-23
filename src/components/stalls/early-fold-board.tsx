import Link from "next/link";

import { EarlyFoldEmpty } from "@/app/stalls/[slug]/fold/empty";
import { EarlyFoldForm } from "@/components/stalls/early-fold-form";
import { SyncEarlyFold } from "@/components/stalls/sync-early-fold";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  EARLY_FOLD_EMPTY_TAPE,
  EARLY_FOLD_MIRROR_SCRIPT,
  EARLY_FOLD_PACKED_LEFTOVER,
  EARLY_FOLD_PAPER_LINE,
  type EarlyFoldMap,
  type EarlyFoldNote,
} from "@/lib/early-fold";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function EarlyFoldBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: EarlyFoldMap;
  current?: EarlyFoldNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: EARLY_FOLD_MIRROR_SCRIPT }} />
      <SyncEarlyFold map={map} />

      <MallHero>
        <MallCrumb label="Folding up at noon">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Last call</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not packed
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not new hours
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Folding up at noon</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Hours say two. Boxing starts at noon.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {EARLY_FOLD_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            at 1 should not find a ghost that is still on the lot map.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The last-call note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                When are you folding?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Boxing at noon. Hours stay the
                Saturday plan. Clear deletes this booth only.
              </p>
            </div>
            <EarlyFoldForm
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
              . The lot still says who set up. This note does not pack the
              booth or rewrite Saturday hours.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank last-call note"
                title={EARLY_FOLD_EMPTY_TAPE}
                body="Empty tape does not stick. Write when you fold — Boxing at noon. — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Folding up at noon."
                body={
                  <div className="space-y-3">
                    <p data-early-fold-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-early-fold-leftover="">{EARLY_FOLD_PACKED_LEFTOVER}</p>
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
              <EarlyFoldEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
