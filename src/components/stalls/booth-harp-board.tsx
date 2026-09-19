import Link from "next/link";

import { BoothHarpEmpty } from "@/app/stalls/[slug]/harp/empty";
import { BoothHarpForm } from "@/components/stalls/booth-harp-form";
import { SyncBoothHarp } from "@/components/stalls/sync-booth-harp";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_HARP_EMPTY_TAPE,
  BOOTH_HARP_MIRROR_SCRIPT,
  BOOTH_HARP_PACKED_LEFTOVER,
  BOOTH_HARP_PAPER_LINE,
  type BoothHarpMap,
  type BoothHarpNote,
} from "@/lib/booth-harp";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothHarpBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothHarpMap;
  current?: BoothHarpNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_HARP_MIRROR_SCRIPT }} />
      <SyncBoothHarp map={map} />

      <MallHero>
        <MallCrumb label="I don't have a harp">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Shade stays</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Shade stays
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a lighting shop
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a harp</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Shade stays in the box.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_HARP_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a harp to seat the shade.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The harp note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a harp.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a harp. Shade
                stays in the box. Not a lighting shop. Clear deletes this booth
                only.
              </p>
            </div>
            <BoothHarpForm
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
              . The lot still says who set up. This note does not rewrite the
              lamp page or the buy grid.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank harp note"
                title={BOOTH_HARP_EMPTY_TAPE}
                body="Empty tape does not stick. Write the harp note — I don't have a harp — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a harp."
                body={
                  <div className="space-y-3">
                    <p data-booth-harp-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-harp-leftover="">
                        {BOOTH_HARP_PACKED_LEFTOVER}
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
              <BoothHarpEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
