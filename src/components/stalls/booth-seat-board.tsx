import Link from "next/link";

import { BoothSeatEmpty } from "@/app/stalls/[slug]/seat/empty";
import { BoothSeatForm } from "@/components/stalls/booth-seat-form";
import { SyncBoothSeat } from "@/components/stalls/sync-booth-seat";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_SEAT_EMPTY_TAPE,
  BOOTH_SEAT_MIRROR_SCRIPT,
  BOOTH_SEAT_PACKED_LEFTOVER,
  BOOTH_SEAT_PAPER_LINE,
  type BoothSeatMap,
  type BoothSeatNote,
} from "@/lib/booth-seat";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothSeatBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothSeatMap;
  current?: BoothSeatNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SEAT_MIRROR_SCRIPT }} />
      <SyncBoothSeat map={map} />

      <MallHero>
        <MallCrumb label="Don't sit on the crate">
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
            Stock, not a chair
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not hangers
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Don&apos;t sit on the crate</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The crate is stock, not a chair.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_SEAT_PAPER_LINE} {stall.boothName} keeps this note. Stay is
            hangers. Kids is you-buy-it. Walkers still sit on Sunday Crate.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The sit note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                The crate is stock.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Don&apos;t sit on the crate. The
                crate is stock, not a chair. Stay is hangers. Kids is you-buy-it.
                Walkers still sit on Sunday Crate. Clear deletes this booth
                only.
              </p>
            </div>
            <BoothSeatForm
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
              . The lot still says who set up. This note does not rewrite stay
              or kids.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank sit note"
                title={BOOTH_SEAT_EMPTY_TAPE}
                body="Empty tape does not stick. Write the sit note — don't sit on the crate — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Don't sit on the crate."
                body={
                  <div className="space-y-3">
                    <p data-booth-seat-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-seat-leftover="">
                        {BOOTH_SEAT_PACKED_LEFTOVER}
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
              <BoothSeatEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
