import Link from "next/link";

import { BoothBulbEmpty } from "@/app/stalls/[slug]/bulb/empty";
import { BoothBulbForm } from "@/components/stalls/booth-bulb-form";
import { SyncBoothBulb } from "@/components/stalls/sync-booth-bulb";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_BULB_EMPTY_TAPE,
  BOOTH_BULB_MIRROR_SCRIPT,
  BOOTH_BULB_PACKED_LEFTOVER,
  BOOTH_BULB_PAPER_LINE,
  type BoothBulbMap,
  type BoothBulbNote,
} from "@/lib/booth-bulb";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothBulbBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothBulbMap;
  current?: BoothBulbNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_BULB_MIRROR_SCRIPT }} />
      <SyncBoothBulb map={map} />

      <MallHero>
        <MallCrumb label="I don't have a bulb">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Bring your own</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Bring your own
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a hardware shop
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a bulb</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Twist the neck anyway.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_BULB_PAPER_LINE} {stall.boothName} keeps this note. Twist is
            the neck. Cord is the rewire. Walkers still want a spare.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The bulb note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a bulb.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a bulb. Twist the
                neck anyway. Not a hardware shop. Not cord. Not twist. Clear
                deletes this booth only.
              </p>
            </div>
            <BoothBulbForm
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
              . The lot still says who set up. This note does not rewrite cord,
              box, or twist.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank bulb note"
                title={BOOTH_BULB_EMPTY_TAPE}
                body="Empty tape does not stick. Write the bulb note — I don't have a bulb — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a bulb."
                body={
                  <div className="space-y-3">
                    <p data-booth-bulb-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-bulb-leftover="">
                        {BOOTH_BULB_PACKED_LEFTOVER}
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
              <BoothBulbEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
