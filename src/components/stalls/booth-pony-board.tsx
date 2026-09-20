import Link from "next/link";

import { BoothPonyEmpty } from "@/app/stalls/[slug]/pony/empty";
import { BoothPonyForm } from "@/components/stalls/booth-pony-form";
import { SyncBoothPony } from "@/components/stalls/sync-booth-pony";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_PONY_EMPTY_TAPE,
  BOOTH_PONY_MIRROR_SCRIPT,
  BOOTH_PONY_PACKED_LEFTOVER,
  BOOTH_PONY_PAPER_LINE,
  type BoothPonyMap,
  type BoothPonyNote,
} from "@/lib/booth-pony";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothPonyBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothPonyMap;
  current?: BoothPonyNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-pony-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PONY_MIRROR_SCRIPT }} />
      <SyncBoothPony map={map} />

      <MallHero>
        <MallCrumb label="I don't have a pony">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a closet</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a closet
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Closet
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a pony</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a closet.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_PONY_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a stitching pony, or so they can clamp a strap before
            they buy.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The pony note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a pony.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a pony. Still a
                closet. Clear deletes this booth only.
              </p>
            </div>
            <BoothPonyForm
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
              . The lot still says who set up. This note does not rewrite sew,
              thimble, last, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank pony note"
                title={BOOTH_PONY_EMPTY_TAPE}
                body="Empty tape does not stick. Write the pony note — I don't have a pony — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a pony."
                body={
                  <div className="space-y-3">
                    <p data-booth-pony-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-pony-leftover="">
                        {BOOTH_PONY_PACKED_LEFTOVER}
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
              <BoothPonyEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
