import Link from "next/link";

import { BreakBillsEmpty } from "@/app/stalls/[slug]/break/empty";
import { BreakBillsForm } from "@/components/stalls/break-bills-form";
import { SyncBreakBills } from "@/components/stalls/sync-break-bills";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BREAK_BILLS_EMPTY_TAPE,
  BREAK_BILLS_MIRROR_SCRIPT,
  BREAK_BILLS_PACKED_LEFTOVER,
  BREAK_BILLS_PAPER_LINE,
  type BreakBillsMap,
  type BreakBillsNote,
} from "@/lib/break-bills";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BreakBillsBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BreakBillsMap;
  current?: BreakBillsNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BREAK_BILLS_MIRROR_SCRIPT }} />
      <SyncBreakBills map={map} />

      <MallHero>
        <MallCrumb label="I can break a twenty">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Change jar</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not the slip
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a till
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I can break a twenty</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Ones and fives live in the jar.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BREAK_BILLS_PAPER_LINE} {stall.boothName} keeps this note. Tender
            is still cash or card on the slip.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The change note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What is in the jar?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Ones and fives. Tender stays the
                slip. Clear deletes this booth only.
              </p>
            </div>
            <BreakBillsForm
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
              cash vs card or Saturday hours.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank change note"
                title={BREAK_BILLS_EMPTY_TAPE}
                body="Empty tape does not stick. Write what is in the jar — ones and fives — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I can break a twenty."
                body={
                  <div className="space-y-3">
                    <p data-break-bills-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-break-bills-leftover="">
                        {BREAK_BILLS_PACKED_LEFTOVER}
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
              <BreakBillsEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
