"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { StallMissing } from "@/components/mall-missing";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Button } from "@/components/ui/button";
import {
  readOrderSlips,
  subscribeOrderSlips,
  type OrderSlip,
} from "@/lib/order-history";
import { stallPath, stallTapePath } from "@/lib/paths";
import {
  mergePaidStashSlips,
  paidStashForSlug,
  STASH_EMPTY_BODY,
  STASH_EMPTY_COPY,
  STASH_HAND_LINE,
  type PaidStashSheet,
  type PaidStashSlip,
} from "@/lib/paid-stash";
import {
  readTakenHandoffs,
  subscribeTaken,
  type TakenHandoff,
} from "@/lib/taken-handoff";

const emptyOrders: OrderSlip[] = [];
const emptyTaken: TakenHandoff[] = [];

function StashEmpty({ sheet }: { sheet: PaidStashSheet }) {
  const stall = sheet.stall;

  return (
    <MallNotice
      tone="empty"
      eyebrow="Paid stash"
      title={STASH_EMPTY_COPY}
      body={STASH_EMPTY_BODY}
      actions={
        stall ? (
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={stallPath(stall.slug)} />}
            >
              Back to the booth
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={stallTapePath(stall.slug)} />}
            >
              See the table tape
            </Button>
          </>
        ) : (
          <Button className="rounded-full px-5" render={<Link href="/explore" />}>
            Walk the concourse
          </Button>
        )
      }
    >
      <div data-paid-stash="empty" />
    </MallNotice>
  );
}

function StashSheet({ sheet }: { sheet: PaidStashSheet }) {
  const stall = sheet.stall;

  if (!stall) {
    return <StallMissing />;
  }

  return (
    <div>
      <MallHero className="print:hidden">
        <MallCrumb label="Paid stash">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Stash</span>
        </MallCrumb>

        <MallEyebrow>Paid, not taken</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Don’t bag this paper.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Paid lamps still sit on this booth until they walk. Screenshot it
            or print it. Files stay in the folder. {STASH_HAND_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid max-w-2xl gap-6"
      >
        <article
          data-paid-stash="sheet"
          data-paid-stash-stall={stall.id}
          className="paid-stash-print w-full rounded-sm border-2 border-foreground/70 bg-card px-5 py-6 print:rounded-none print:border-black print:bg-white"
        >
          <MallEyebrow className="text-current/55">
            Paid stash tonight
          </MallEyebrow>
          <h2 className="mt-3 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
            {stall.boothName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {stall.blurb}
          </p>

          <ul className="mt-6 divide-y divide-border print:divide-black/20">
            {sheet.rows.map((row) => (
              <li
                key={`${row.slipId}:${row.listingId}`}
                data-paid-stash-listing={row.listingId}
                data-paid-stash-slip={row.slipId}
                className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="font-heading text-xl leading-snug tracking-tight text-balance">
                    {row.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {row.factLabel}
                    </span>
                    {": "}
                    {row.fact}
                  </p>
                  <p className="mt-1 font-mono text-xs tracking-wide text-muted-foreground">
                    Slip {row.slipId}
                  </p>
                </div>
                <p
                  data-paid-stash-tag={row.listingId}
                  className="font-heading text-3xl tracking-tight sm:text-right"
                >
                  {row.tagLabel}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-6 text-foreground">{sheet.refuse}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {STASH_HAND_LINE}
          </p>
        </article>

        <div className="flex flex-col gap-3 print:hidden">
          <Button
            className="w-full rounded-full sm:w-auto"
            render={<Link href={stallPath(stall.slug)} />}
          >
            Back to the booth
          </Button>
        </div>
      </MallSection>
    </div>
  );
}

export function PaidStashView({
  slug,
  seed,
  takenSeed = emptyTaken,
}: {
  slug: string;
  seed: PaidStashSlip | null;
  takenSeed?: TakenHandoff[];
}) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );
  const taken = useSyncExternalStore(
    subscribeTaken,
    readTakenHandoffs,
    () => takenSeed,
  );

  const slips = mergePaidStashSlips(stored, seed);
  const sheet = paidStashForSlug(slug, slips, taken);

  if (sheet.kind === "missing") {
    return (
      <div data-paid-stash="missing">
        <StallMissing />
      </div>
    );
  }

  if (sheet.kind === "empty") {
    return <StashEmpty sheet={sheet} />;
  }

  return <StashSheet sheet={sheet} />;
}
