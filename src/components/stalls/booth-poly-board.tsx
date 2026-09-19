import Link from "next/link";

import { BoothPolyEmpty } from "@/app/stalls/[slug]/poly/empty";
import { BoothPolyForm } from "@/components/stalls/booth-poly-form";
import { SyncBoothPoly } from "@/components/stalls/sync-booth-poly";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_POLY_EMPTY_TAPE,
  BOOTH_POLY_MIRROR_SCRIPT,
  BOOTH_POLY_PACKED_LEFTOVER,
  BOOTH_POLY_PAPER_LINE,
  type BoothPolyMap,
  type BoothPolyNote,
} from "@/lib/booth-poly";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothPolyBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothPolyMap;
  current?: BoothPolyNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_POLY_MIRROR_SCRIPT }} />
      <SyncBoothPoly map={map} />

      <MallHero>
        <MallCrumb label="Keep the poly on">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The crate</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            The crate
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not ask-first
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Keep the poly on</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The crate stays sealed.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_POLY_PAPER_LINE} {stall.boothName} keeps this note. Ask is
            still one sleeve.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The poly note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What stays sealed?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Keep the poly on. The crate stays
                sealed. Clear deletes this booth only.
              </p>
            </div>
            <BoothPolyForm
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
              . The lot still says who set up. This note does not rewrite ask,
              film, or a flyer.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank poly note"
                title={BOOTH_POLY_EMPTY_TAPE}
                body="Empty tape does not stick. Write the poly note — keep the poly on — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Keep the poly on."
                body={
                  <div className="space-y-3">
                    <p data-booth-poly-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-poly-leftover="">
                        {BOOTH_POLY_PACKED_LEFTOVER}
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
              <BoothPolyEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
