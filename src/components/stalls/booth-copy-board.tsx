import Link from "next/link";

import { BoothCopyEmpty } from "@/app/stalls/[slug]/copy/empty";
import { BoothCopyForm } from "@/components/stalls/booth-copy-form";
import { SyncBoothCopy } from "@/components/stalls/sync-booth-copy";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_COPY_EMPTY_TAPE,
  BOOTH_COPY_MIRROR_SCRIPT,
  BOOTH_COPY_PACKED_LEFTOVER,
  BOOTH_COPY_PAPER_LINE,
  type BoothCopyMap,
  type BoothCopyNote,
} from "@/lib/booth-copy";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothCopyBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothCopyMap;
  current?: BoothCopyNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_COPY_MIRROR_SCRIPT }} />
      <SyncBoothCopy map={map} />

      <MallHero>
        <MallCrumb label="I will not copy onto your stick">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Folder after pay</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Folder after pay
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a copy booth
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I will not copy onto your stick</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Folder after pay.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_COPY_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want the pack on a USB. I will not copy it here.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The copy note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I will not copy onto your stick.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I will not copy onto your stick.
                Folder after pay. Not a copy booth. Clear deletes this booth
                only.
              </p>
            </div>
            <BoothCopyForm
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
                eyebrow="Blank copy note"
                title={BOOTH_COPY_EMPTY_TAPE}
                body="Empty tape does not stick. Write the copy note — I will not copy onto your stick — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I will not copy onto your stick."
                body={
                  <div className="space-y-3">
                    <p data-booth-copy-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-copy-leftover="">
                        {BOOTH_COPY_PACKED_LEFTOVER}
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
              <BoothCopyEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
