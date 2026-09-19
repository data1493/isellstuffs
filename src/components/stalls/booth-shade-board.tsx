import Link from "next/link";

import { BoothShadeEmpty } from "@/app/stalls/[slug]/shade/empty";
import { BoothShadeForm } from "@/components/stalls/booth-shade-form";
import { SyncBoothShade } from "@/components/stalls/sync-booth-shade";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_SHADE_EMPTY_TAPE,
  BOOTH_SHADE_MIRROR_SCRIPT,
  BOOTH_SHADE_PACKED_LEFTOVER,
  BOOTH_SHADE_PAPER_LINE,
  type BoothShadeMap,
  type BoothShadeNote,
} from "@/lib/booth-shade";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothShadeBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothShadeMap;
  current?: BoothShadeNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SHADE_MIRROR_SCRIPT }} />
      <SyncBoothShade map={map} />

      <MallHero>
        <MallCrumb label="Keep it in the shade">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The shade</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            This afternoon
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a rain date
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Keep it in the shade</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The crate sits in the sun.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_SHADE_PAPER_LINE} {stall.boothName} keeps this note. Rain is
            still Sunday if wet.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The shade note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What stays out of the sun?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Records stay in the shade. Jackets
                crease in the sun. Clear deletes this booth only.
              </p>
            </div>
            <BoothShadeForm
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
              . The lot still says who set up. This note does not rewrite rain,
              hangers stay, or tote math.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank shade note"
                title={BOOTH_SHADE_EMPTY_TAPE}
                body="Empty tape does not stick. Write what stays in the shade — records, jackets — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Keep it in the shade."
                body={
                  <div className="space-y-3">
                    <p data-booth-shade-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-shade-leftover="">
                        {BOOTH_SHADE_PACKED_LEFTOVER}
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
              <BoothShadeEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
