import Link from "next/link";

import { BoothSewEmpty } from "@/app/stalls/[slug]/sew/empty";
import { BoothSewForm } from "@/components/stalls/booth-sew-form";
import { SyncBoothSew } from "@/components/stalls/sync-booth-sew";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_SEW_EMPTY_TAPE,
  BOOTH_SEW_MIRROR_SCRIPT,
  BOOTH_SEW_PACKED_LEFTOVER,
  BOOTH_SEW_PAPER_LINE,
  type BoothSewMap,
  type BoothSewNote,
} from "@/lib/booth-sew";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothSewBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothSewMap;
  current?: BoothSewNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SEW_MIRROR_SCRIPT }} />
      <SyncBoothSew map={map} />

      <MallHero>
        <MallCrumb label="I don't sew">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">I don&apos;t hem it</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Take it as-is
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a wash
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t sew</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            I don&apos;t hem it.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_SEW_PAPER_LINE} {stall.boothName} keeps this note. Wash is
            laundry paper. Size is the tag. Walkers still ask Hall Closet to
            take a cuff in.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The sew note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                Take it as-is.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t sew. I don&apos;t hem
                it. Take it as-is. Wash is laundry paper. Size is the tag. Not
                wash. Not stay. Not a cuff. Clear deletes this booth only.
              </p>
            </div>
            <BoothSewForm
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
              wash, size, or hangers stay.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank sew note"
                title={BOOTH_SEW_EMPTY_TAPE}
                body="Empty tape does not stick. Write the sew note — I don't sew — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't sew."
                body={
                  <div className="space-y-3">
                    <p data-booth-sew-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-sew-leftover="">
                        {BOOTH_SEW_PACKED_LEFTOVER}
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
              <BoothSewEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
