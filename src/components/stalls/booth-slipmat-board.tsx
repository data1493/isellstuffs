import Link from "next/link";

import { BoothSlipmatEmpty } from "@/app/stalls/[slug]/slipmat/empty";
import { BoothSlipmatForm } from "@/components/stalls/booth-slipmat-form";
import { SyncBoothSlipmat } from "@/components/stalls/sync-booth-slipmat";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_SLIPMAT_EMPTY_TAPE,
  BOOTH_SLIPMAT_MIRROR_SCRIPT,
  BOOTH_SLIPMAT_PACKED_LEFTOVER,
  BOOTH_SLIPMAT_PAPER_LINE,
  type BoothSlipmatMap,
  type BoothSlipmatNote,
} from "@/lib/booth-slipmat";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothSlipmatBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothSlipmatMap;
  current?: BoothSlipmatNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-slipmat-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SLIPMAT_MIRROR_SCRIPT }} />
      <SyncBoothSlipmat map={map} />

      <MallHero>
        <MallCrumb label="I don't have a slipmat">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a crate. Still no deck</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a crate
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still no deck
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a slipmat</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a crate. Still no deck.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_SLIPMAT_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a slipmat to cue the LP.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The slipmat note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a slipmat.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a slipmat. Still
                a crate. Still no deck. Clear deletes this booth only.
              </p>
            </div>
            <BoothSlipmatForm
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
              deck, seat, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank slipmat note"
                title={BOOTH_SLIPMAT_EMPTY_TAPE}
                body="Empty tape does not stick. Write the slipmat note — I don't have a slipmat — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a slipmat."
                body={
                  <div className="space-y-3">
                    <p data-booth-slipmat-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-slipmat-leftover="">
                        {BOOTH_SLIPMAT_PACKED_LEFTOVER}
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
              <BoothSlipmatEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
