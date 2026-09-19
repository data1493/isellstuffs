import Link from "next/link";

import { BoothWrapEmpty } from "@/app/stalls/[slug]/wrap/empty";
import { BoothWrapForm } from "@/components/stalls/booth-wrap-form";
import { SyncBoothWrap } from "@/components/stalls/sync-booth-wrap";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_WRAP_EMPTY_TAPE,
  BOOTH_WRAP_MIRROR_SCRIPT,
  BOOTH_WRAP_PACKED_LEFTOVER,
  BOOTH_WRAP_PAPER_LINE,
  type BoothWrapMap,
  type BoothWrapNote,
} from "@/lib/booth-wrap";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothWrapBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothWrapMap;
  current?: BoothWrapNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_WRAP_MIRROR_SCRIPT }} />
      <SyncBoothWrap map={map} />

      <MallHero>
        <MallCrumb label="I wrap breakables">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The newspaper</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Paper wrap
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not shipping
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I wrap breakables</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The mug still walks naked.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_WRAP_PAPER_LINE} {stall.boothName} keeps this note. The yard
            sign is still no-ship.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The wrap note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What gets newspaper?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I wrap breakables. The mug still
                walks naked. Clear deletes this booth only.
              </p>
            </div>
            <BoothWrapForm
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
              yard sign, smoke, or a poly bag.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank wrap note"
                title={BOOTH_WRAP_EMPTY_TAPE}
                body="Empty tape does not stick. Write the wrap note — mugs get newspaper — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I wrap breakables."
                body={
                  <div className="space-y-3">
                    <p data-booth-wrap-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-wrap-leftover="">
                        {BOOTH_WRAP_PACKED_LEFTOVER}
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
              <BoothWrapEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
