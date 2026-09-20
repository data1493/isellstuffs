import Link from "next/link";

import { BoothStatorEmpty } from "@/app/stalls/[slug]/stator/empty";
import { BoothStatorForm } from "@/components/stalls/booth-stator-form";
import { SyncBoothStator } from "@/components/stalls/sync-booth-stator";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_STATOR_EMPTY_TAPE,
  BOOTH_STATOR_MIRROR_SCRIPT,
  BOOTH_STATOR_PACKED_LEFTOVER,
  BOOTH_STATOR_PAPER_LINE,
  type BoothStatorMap,
  type BoothStatorNote,
} from "@/lib/booth-stator";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothStatorBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothStatorMap;
  current?: BoothStatorNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-stator-state={current ? "taped" : "open"}>
      <script
        dangerouslySetInnerHTML={{ __html: BOOTH_STATOR_MIRROR_SCRIPT }}
      />
      <SyncBoothStator map={map} />

      <MallHero>
        <MallCrumb label="I don't have a stator">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a crate</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a crate
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Sunday Crate
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a stator</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a crate.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_STATOR_PAPER_LINE} {stall.boothName} keeps this note.
            Walkers still want a stator, or so the unnamed LP sits
            shop-driven without a shop eddy.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The stator note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a stator.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a stator. Still
                a crate. Clear deletes this booth only.
              </p>
            </div>
            <BoothStatorForm
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
              bone, eddy, flywheel, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank stator note"
                title={BOOTH_STATOR_EMPTY_TAPE}
                body="Empty tape does not stick. Write the stator note — I don't have a stator — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a stator."
                body={
                  <div className="space-y-3">
                    <p data-booth-stator-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-stator-leftover="">
                        {BOOTH_STATOR_PACKED_LEFTOVER}
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
              <BoothStatorEmpty
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
