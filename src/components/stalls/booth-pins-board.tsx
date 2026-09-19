import Link from "next/link";

import { BoothPinsEmpty } from "@/app/stalls/[slug]/pins/empty";
import { BoothPinsForm } from "@/components/stalls/booth-pins-form";
import { SyncBoothPins } from "@/components/stalls/sync-booth-pins";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_PINS_EMPTY_TAPE,
  BOOTH_PINS_MIRROR_SCRIPT,
  BOOTH_PINS_PACKED_LEFTOVER,
  BOOTH_PINS_PAPER_LINE,
  type BoothPinsMap,
  type BoothPinsNote,
} from "@/lib/booth-pins";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothPinsBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothPinsMap;
  current?: BoothPinsNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PINS_MIRROR_SCRIPT }} />
      <SyncBoothPins map={map} />

      <MallHero>
        <MallCrumb label="I don't have pins">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Hem stays</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Hem stays
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still tote
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have pins</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Hem stays.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_PINS_PAPER_LINE} {stall.boothName} keeps this note.
            Walkers still want a pin for the hem.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The pins note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have pins.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have pins. Hem
                stays. Still a rack. Clear deletes this booth only.
              </p>
            </div>
            <BoothPinsForm
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
              buttons, sew, stay, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank pins note"
                title={BOOTH_PINS_EMPTY_TAPE}
                body="Empty tape does not stick. Write the pins note — I don't have pins — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have pins."
                body={
                  <div className="space-y-3">
                    <p data-booth-pins-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-pins-leftover="">
                        {BOOTH_PINS_PACKED_LEFTOVER}
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
              <BoothPinsEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
