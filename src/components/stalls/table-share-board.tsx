import Link from "next/link";

import { TableShareEmpty } from "@/app/stalls/[slug]/share/empty";
import { TableShareForm } from "@/components/stalls/table-share-form";
import { SyncTableShare } from "@/components/stalls/sync-table-share";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";
import {
  TABLE_SHARE_EMPTY_TAPE,
  TABLE_SHARE_MIRROR_SCRIPT,
  TABLE_SHARE_PACKED_LEFTOVER,
  TABLE_SHARE_PAPER_LINE,
  TABLE_SHARE_SELF_TAPE,
  type TableShare,
  type TableShareMap,
} from "@/lib/table-share";

export function TableShareBoard({
  stall,
  map,
  current,
  sharer,
  packed,
  emptyTape,
  selfTape,
}: {
  stall: Stall;
  map: TableShareMap;
  current?: TableShare;
  sharer?: Stall;
  packed: boolean;
  emptyTape?: boolean;
  selfTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: TABLE_SHARE_MIRROR_SCRIPT }} />
      <SyncTableShare map={map} />

      <MallHero>
        <MallCrumb label="Sharing this table">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Share</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Two names
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a sitter
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a seventh stall
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Sharing this table</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Two sellers. One table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {TABLE_SHARE_PAPER_LINE} {stall.boothName} names the other stall.
            A booth cannot share itself. SKUs stay with their stall.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The share note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                Who is sharing?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Pick a catalog booth. The Hall Closet can share Folding Table
                Tuesday. Clear deletes this booth only. Closet titles stay on
                Closet.
              </p>
            </div>
            <TableShareForm
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
              . Cover stays a sitter. This tape is two names on one table.
              Not a seventh stall.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank share note"
                title={TABLE_SHARE_EMPTY_TAPE}
                body="Empty tape does not stick. Pick a real catalog booth — not this table — then tape it."
              />
            ) : null}

            {selfTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Self-share"
                title={TABLE_SHARE_SELF_TAPE}
                body="Tape a neighbor. Folding Table Tuesday cannot share Folding Table Tuesday."
              />
            ) : null}

            {sharer ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Sharing this table."
                body={
                  <div className="space-y-3">
                    <p data-table-share-sharer={stall.id}>{sharer.boothName}</p>
                    <p>SKUs stay on {sharer.boothName}.</p>
                    {packed ? (
                      <p data-table-share-leftover="">
                        {TABLE_SHARE_PACKED_LEFTOVER}
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
                    href={stallPath(sharer.slug)}
                    className="underline underline-offset-4"
                  >
                    Open {sharer.boothName}
                  </Link>
                </p>
              </MallNotice>
            ) : emptyTape || selfTape ? null : (
              <TableShareEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
