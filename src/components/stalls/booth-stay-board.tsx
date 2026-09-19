import Link from "next/link";

import { BoothStayEmpty } from "@/app/stalls/[slug]/stay/empty";
import { BoothStayForm } from "@/components/stalls/booth-stay-form";
import { SyncBoothStay } from "@/components/stalls/sync-booth-stay";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_STAY_EMPTY_TAPE,
  BOOTH_STAY_MIRROR_SCRIPT,
  BOOTH_STAY_PACKED_LEFTOVER,
  BOOTH_STAY_PAPER_LINE,
  type BoothStayMap,
  type BoothStayNote,
} from "@/lib/booth-stay";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothStayBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothStayMap;
  current?: BoothStayNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STAY_MIRROR_SCRIPT }} />
      <SyncBoothStay map={map} />

      <MallHero>
        <MallCrumb label="Hangers stay">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The rack</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Furniture
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not the free box
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Hangers stay</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The rack is furniture.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_STAY_PAPER_LINE} {stall.boothName} keeps this note. Free is
            extras you can take.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The stay note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What stays with the booth?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Hangers stay. The rack is
                furniture. Clear deletes this booth only.
              </p>
            </div>
            <BoothStayForm
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
              free box or tote math.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank stay note"
                title={BOOTH_STAY_EMPTY_TAPE}
                body="Empty tape does not stick. Write what stays — hangers stay — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Hangers stay."
                body={
                  <div className="space-y-3">
                    <p data-booth-stay-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-stay-leftover="">
                        {BOOTH_STAY_PACKED_LEFTOVER}
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
              <BoothStayEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
