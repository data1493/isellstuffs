import Link from "next/link";

import { BoothCoverEmpty } from "@/app/stalls/[slug]/cover/empty";
import { BoothCoverForm } from "@/components/stalls/booth-cover-form";
import { SyncBoothCover } from "@/components/stalls/sync-booth-cover";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_COVER_EMPTY_TAPE,
  BOOTH_COVER_MIRROR_SCRIPT,
  BOOTH_COVER_PACKED_LEFTOVER,
  BOOTH_COVER_PAPER_LINE,
  BOOTH_COVER_SELF_TAPE,
  type BoothCover,
  type BoothCoverMap,
} from "@/lib/booth-cover";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothCoverBoard({
  stall,
  map,
  current,
  sitter,
  packed,
  emptyTape,
  selfTape,
}: {
  stall: Stall;
  map: BoothCoverMap;
  current?: BoothCover;
  sitter?: Stall;
  packed: boolean;
  emptyTape?: boolean;
  selfTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_COVER_MIRROR_SCRIPT }} />
      <SyncBoothCover map={map} />

      <MallHero>
        <MallCrumb label="Neighbor is sitting">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Cover</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not lunch
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a watch
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Neighbor is sitting</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Who is covering the table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_COVER_PAPER_LINE} {stall.boothName} names the stall next
            door. A booth cannot sit itself.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The cover note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                Who is sitting?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Pick a catalog booth. The Hall Closet can watch Folding Table
                Tuesday. Clear deletes this booth only.
              </p>
            </div>
            <BoothCoverForm
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
              . Lunch stays a taco-truck note. Watch stays a buyer follow.
              This tape is who is covering the table.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank cover note"
                title={BOOTH_COVER_EMPTY_TAPE}
                body="Empty tape does not stick. Pick a real catalog booth — not this table — then tape it."
              />
            ) : null}

            {selfTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Self-sitter"
                title={BOOTH_COVER_SELF_TAPE}
                body="Tape a neighbor. Folding Table Tuesday cannot cover Folding Table Tuesday."
              />
            ) : null}

            {sitter ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Neighbor is sitting."
                body={
                  <div className="space-y-3">
                    <p data-booth-cover-sitter={stall.id}>{sitter.boothName}</p>
                    {packed ? (
                      <p data-booth-cover-leftover="">
                        {BOOTH_COVER_PACKED_LEFTOVER}
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
                  {" · "}
                  <Link
                    href={stallPath(sitter.slug)}
                    className="underline underline-offset-4"
                  >
                    Open {sitter.boothName}
                  </Link>
                </p>
              </MallNotice>
            ) : emptyTape || selfTape ? null : (
              <BoothCoverEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
