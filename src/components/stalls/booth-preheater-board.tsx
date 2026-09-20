import Link from "next/link";

import { BoothPreheaterEmpty } from "@/app/stalls/[slug]/preheater/empty";
import { BoothPreheaterForm } from "@/components/stalls/booth-preheater-form";
import { SyncBoothPreheater } from "@/components/stalls/sync-booth-preheater";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_PREHEATER_EMPTY_TAPE,
  BOOTH_PREHEATER_MIRROR_SCRIPT,
  BOOTH_PREHEATER_PACKED_LEFTOVER,
  BOOTH_PREHEATER_PAPER_LINE,
  type BoothPreheaterMap,
  type BoothPreheaterNote,
} from "@/lib/booth-preheater";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothPreheaterBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothPreheaterMap;
  current?: BoothPreheaterNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-preheater-state={current ? "taped" : "open"}>
      <script
        dangerouslySetInnerHTML={{ __html: BOOTH_PREHEATER_MIRROR_SCRIPT }}
      />
      <SyncBoothPreheater map={map} />

      <MallHero>
        <MallCrumb label="I don't have a preheater">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a driveway</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a driveway
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still no bench
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Half-Working
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a preheater</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a driveway. Still no bench.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_PREHEATER_PAPER_LINE} {stall.boothName} keeps this note.
            Walkers still want a preheater, or so the cracked Game Boy joints
            loosen without a shop tweezers.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The preheater note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a preheater.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a preheater.
                Still a driveway. Still no bench. Clear deletes this booth only.
              </p>
            </div>
            <BoothPreheaterForm
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
              . The lot still says who set up. This note does not rewrite
              tweezers, fume, variac, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank preheater note"
                title={BOOTH_PREHEATER_EMPTY_TAPE}
                body="Empty tape does not stick. Write the preheater note — I don't have a preheater — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a preheater."
                body={
                  <div className="space-y-3">
                    <p data-booth-preheater-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-preheater-leftover="">
                        {BOOTH_PREHEATER_PACKED_LEFTOVER}
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
              <BoothPreheaterEmpty
                slug={stall.slug}
                boothName={stall.boothName}
              />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
