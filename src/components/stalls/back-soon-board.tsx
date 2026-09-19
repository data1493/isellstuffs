import Link from "next/link";

import { BackSoonEmpty } from "@/app/stalls/[slug]/back/empty";
import { BackSoonForm } from "@/components/stalls/back-soon-form";
import { SyncBackSoon } from "@/components/stalls/sync-back-soon";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BACK_SOON_EMPTY_TAPE,
  BACK_SOON_MIRROR_SCRIPT,
  BACK_SOON_PACKED_LEFTOVER,
  BACK_SOON_PAPER_LINE,
  type BackSoonMap,
  type BackSoonNote,
} from "@/lib/back-soon";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BackSoonBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BackSoonMap;
  current?: BackSoonNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BACK_SOON_MIRROR_SCRIPT }} />
      <SyncBackSoon map={map} />

      <MallHero>
        <MallCrumb label="Back after lunch">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Lunch</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not packed
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not new hours
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Back after lunch</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Stepped out for a taco.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BACK_SOON_PAPER_LINE} {stall.boothName} keeps this note. A lunch
            run is not the table in the car.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The lunch note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                When are you back?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Taco truck, back at 1. Cash on
                the table is still the table. Clear deletes this booth only.
              </p>
            </div>
            <BackSoonForm
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
              . The lot still says who set up. This note does not pack the
              booth or rewrite Saturday hours.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank lunch note"
                title={BACK_SOON_EMPTY_TAPE}
                body="Empty tape does not stick. Write when you are back — taco truck, back at 1 — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Back after lunch."
                body={
                  <div className="space-y-3">
                    <p data-back-soon-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-back-soon-leftover="">{BACK_SOON_PACKED_LEFTOVER}</p>
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
              <BackSoonEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
