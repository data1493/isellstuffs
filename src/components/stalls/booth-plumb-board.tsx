import Link from "next/link";

import { BoothPlumbEmpty } from "@/app/stalls/[slug]/plumb/empty";
import { BoothPlumbForm } from "@/components/stalls/booth-plumb-form";
import { SyncBoothPlumb } from "@/components/stalls/sync-booth-plumb";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_PLUMB_EMPTY_TAPE,
  BOOTH_PLUMB_MIRROR_SCRIPT,
  BOOTH_PLUMB_PACKED_LEFTOVER,
  BOOTH_PLUMB_PAPER_LINE,
  type BoothPlumbMap,
  type BoothPlumbNote,
} from "@/lib/booth-plumb";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothPlumbBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothPlumbMap;
  current?: BoothPlumbNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-plumb-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PLUMB_MIRROR_SCRIPT }} />
      <SyncBoothPlumb map={map} />

      <MallHero>
        <MallCrumb label="I don't have a plumb">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a crack</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a crack
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a stain
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Tuesday
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a plumb</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a crack. Still a stain.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_PLUMB_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a plumb, or so the wobbly lamp hangs true without a shop
            feeler.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The plumb note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a plumb.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a plumb. Still a
                crack. Still a stain. Clear deletes this booth only.
              </p>
            </div>
            <BoothPlumbForm
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
              feeler, drift, mallet, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank plumb note"
                title={BOOTH_PLUMB_EMPTY_TAPE}
                body="Empty tape does not stick. Write the plumb note — I don't have a plumb — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a plumb."
                body={
                  <div className="space-y-3">
                    <p data-booth-plumb-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-plumb-leftover="">
                        {BOOTH_PLUMB_PACKED_LEFTOVER}
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
              <BoothPlumbEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
