import Link from "next/link";

import { BoothMatchEmpty } from "@/app/stalls/[slug]/match/empty";
import { BoothMatchForm } from "@/components/stalls/booth-match-form";
import { SyncBoothMatch } from "@/components/stalls/sync-booth-match";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_MATCH_EMPTY_TAPE,
  BOOTH_MATCH_MIRROR_SCRIPT,
  BOOTH_MATCH_PACKED_LEFTOVER,
  BOOTH_MATCH_PAPER_LINE,
  type BoothMatchMap,
  type BoothMatchNote,
} from "@/lib/booth-match";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothMatchBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothMatchMap;
  current?: BoothMatchNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_MATCH_MIRROR_SCRIPT }} />
      <SyncBoothMatch map={map} />

      <MallHero>
        <MallCrumb label="Nothing matches">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The drawer</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Ask the table
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a lid
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Nothing matches</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Ask what&apos;s on the table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_MATCH_PAPER_LINE} {stall.boothName} keeps this note. Fits is
            the lid. Walkers still hunt The Sink Drawer for the matching pot.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The match note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                The pot is not in this drawer.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Nothing matches. The pot is not in
                this drawer. Ask what&apos;s on the table. Fits is the lid.
                Walkers still hunt The Sink Drawer for the matching pot. Clear
                deletes this booth only.
              </p>
            </div>
            <BoothMatchForm
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
              . The lot still says who set up. This note does not rewrite fits,
              bent, or heat.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank match note"
                title={BOOTH_MATCH_EMPTY_TAPE}
                body="Empty tape does not stick. Write the match note — nothing matches — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Nothing matches."
                body={
                  <div className="space-y-3">
                    <p data-booth-match-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-match-leftover="">
                        {BOOTH_MATCH_PACKED_LEFTOVER}
                      </p>
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
              <BoothMatchEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
