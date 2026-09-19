import Link from "next/link";

import { BoothMeterEmpty } from "@/app/stalls/[slug]/meter/empty";
import { BoothMeterForm } from "@/components/stalls/booth-meter-form";
import { SyncBoothMeter } from "@/components/stalls/sync-booth-meter";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_METER_EMPTY_TAPE,
  BOOTH_METER_MIRROR_SCRIPT,
  BOOTH_METER_PACKED_LEFTOVER,
  BOOTH_METER_PAPER_LINE,
  type BoothMeterMap,
  type BoothMeterNote,
} from "@/lib/booth-meter";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothMeterBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothMeterMap;
  current?: BoothMeterNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_METER_MIRROR_SCRIPT }} />
      <SyncBoothMeter map={map} />

      <MallHero>
        <MallCrumb label="I don't have a meter">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Sold as a pile</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Sold as a pile
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a bench
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a meter</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Sold as a pile.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_METER_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a probe. I don&apos;t have one.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The meter note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a meter.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a meter. Sold as
                a pile. Not a bench. Clear deletes this booth only.
              </p>
            </div>
            <BoothMeterForm
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
              tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank meter note"
                title={BOOTH_METER_EMPTY_TAPE}
                body="Empty tape does not stick. Write the meter note — I don't have a meter — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a meter."
                body={
                  <div className="space-y-3">
                    <p data-booth-meter-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-meter-leftover="">
                        {BOOTH_METER_PACKED_LEFTOVER}
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
              <BoothMeterEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
