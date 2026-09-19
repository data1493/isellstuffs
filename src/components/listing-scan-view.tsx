import Link from "next/link";

import { SyncScan } from "@/components/listing-scan-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  SCAN_EMPTY_COPY,
  SCAN_FILE_COPY,
  SCAN_GIFT_COPY,
  SCAN_GONE_COPY,
  SCAN_MATE_LINE,
  SCAN_MIRROR_SCRIPT,
  SCAN_MISSING_COPY,
  SCAN_PAPER_COPY,
  SCAN_SOLD_COPY,
  SCAN_STALL_COPY,
  SCAN_TABLE_LINE,
  SCAN_TOTE_LINE,
  SCAN_WITH_LINE,
  type ListingScanPair,
} from "@/lib/listing-scan";
import { listingPath, listingScanWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ScanViewKind =
  | "paper"
  | "file"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ScanMateSheet = {
  id: string;
  title: string;
  priceLabel: string;
  fact: string | null;
  kind: "paper" | "file";
};

export type ScanViewSheet = {
  kind: ScanViewKind;
  listingId: string;
  mateId: string | null;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
  mate: ScanMateSheet | null;
  mates: ScanMateSheet[];
};

function ScanMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={SCAN_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ScanRefused({ sheet }: { sheet: ScanViewSheet }) {
  const gift = sheet.kind === "gift";
  const gone = sheet.kind === "file-gone";
  const title = gift
    ? SCAN_GIFT_COPY
    : gone
      ? SCAN_GONE_COPY
      : SCAN_SOLD_COPY;

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : gone ? "Files stay in the folder" : "Walked"}
      title={title}
      body={
        <div className="space-y-2" data-scan-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Scan is paper to a file, not a gift code and not two LPs."
            )}
          </p>
          <p>{SCAN_MATE_LINE}</p>
          <p>{SCAN_WITH_LINE}</p>
        </div>
      }
      actions={
        <>
          {sheet.listing ? (
            <Button
              className="rounded-full px-5"
              render={<Link href={listingPath(sheet.listing.id)} />}
            >
              Back to the listing
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Walk the concourse
          </Button>
        </>
      }
    />
  );
}

function MateCard({
  mate,
  picked,
}: {
  mate: ScanMateSheet;
  picked?: boolean;
}) {
  return (
    <div
      data-scan-choice={mate.id}
      className={cn(
        "rounded-xl bg-background/70 p-4 ring-1",
        picked ? "ring-primary/30" : "ring-foreground/10",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {picked
          ? mate.kind === "file"
            ? "Scanned file"
            : "Scanned paper"
          : mate.kind === "file"
            ? "File on the table"
            : "Paper on the table"}
      </p>
      <p className="mt-1 font-heading text-xl leading-snug tracking-tight">
        {mate.title}
      </p>
      <p className="mt-1 text-sm text-foreground">{mate.priceLabel}</p>
      {mate.fact ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{mate.fact}</p>
      ) : null}
    </div>
  );
}

function ScanForm({
  listingId,
  mateId,
  mates,
  hostKind,
}: {
  listingId: string;
  mateId: string | null;
  mates: ScanMateSheet[];
  hostKind: "paper" | "file";
}) {
  const paired = Boolean(mateId);

  return (
    <form
      method="post"
      action={listingScanWritePath()}
      className="space-y-3"
      data-scan-form={paired ? "apart" : "scan"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={paired ? "apart" : "scan"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/scan`}
      />

      {paired ? (
        <input type="hidden" name="mateId" value={mateId ?? ""} />
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {hostKind === "paper" ? "Liner on this table" : "Paper on this table"}
          </legend>
          {mates.map((mate, index) => (
            <label
              key={mate.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 has-[:checked]:ring-primary/30"
            >
              <input
                type="radio"
                name="mateId"
                value={mate.id}
                defaultChecked={index === 0}
                required
                className="mt-1 size-4 accent-primary"
              />
              <span className="min-w-0">
                <span className="block font-heading text-lg leading-snug">
                  {mate.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {mate.priceLabel}
                  {mate.fact ? ` · ${mate.fact}` : ""}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {paired ? "Take them apart" : "Scan them together"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {paired
          ? `${SCAN_TOTE_LINE} Status stays put.`
          : `${SCAN_TOTE_LINE} ${SCAN_WITH_LINE} ${SCAN_MATE_LINE}`}
      </p>
    </form>
  );
}

export function ListingScanView({
  sheet,
  pairs,
}: {
  sheet: ScanViewSheet;
  pairs: ListingScanPair[];
}) {
  if (sheet.kind === "missing") {
    return <ScanMissing />;
  }

  if (sheet.kind !== "paper" && sheet.kind !== "file") {
    return <ScanRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;
  const paired = Boolean(sheet.mate);
  const emptyTable = !paired && sheet.mates.length === 0;
  const state = paired ? "paired" : emptyTable ? "empty" : "open";

  return (
    <div
      data-scan-sheet={sheet.kind}
      data-scan-state={state}
      data-scan-listing={sheet.listingId}
      data-scan-mate={sheet.mateId ?? ""}
    >
      <script dangerouslySetInnerHTML={{ __html: SCAN_MIRROR_SCRIPT }} />
      <SyncScan pairs={pairs} />

      <MallHero>
        <MallCrumb label="Scan the liner">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Scan</span>
        </MallCrumb>

        <MallEyebrow>Paper and a file</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {paired ? SCAN_TABLE_LINE : "Scan the liner."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {SCAN_MATE_LINE} {SCAN_TOTE_LINE} {SCAN_WITH_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-scan-listing-card={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">
              {sheet.kind === "paper" ? "On the table" : "In the folder"}
            </MallEyebrow>
            {paired ? (
              <Badge variant="outline">Scans with a mate</Badge>
            ) : (
              <Badge variant="ghost">
                {sheet.kind === "paper" ? "This tape only" : "This file only"}
              </Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Asking tag
          </p>
          <p className="mt-1 font-heading text-5xl tracking-tight sm:text-6xl">
            {sheet.priceLabel ?? formatMoney(sheet.listing!.price)}
          </p>

          <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight text-balance">
            {sheet.title}
          </h2>

          {sheet.fact ? (
            <p className="mt-2 text-sm leading-6 text-foreground">{sheet.fact}</p>
          ) : null}

          <dl className="mt-5 grid gap-2 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Stall
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.stallName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Aisle
              </dt>
              <dd className="mt-0.5 font-medium">{sheet.hubName}</dd>
            </div>
          </dl>

          {sheet.mate ? (
            <div className="mt-5 space-y-3">
              <p className="text-sm leading-6 text-foreground">
                {SCAN_TABLE_LINE} Two titles. Two tags. Not one SKU.
              </p>
              <MateCard mate={sheet.mate} picked />
              <Link
                href={listingPath(sheet.mate.id)}
                className="text-sm underline-offset-4 hover:underline"
              >
                Open the mate
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-foreground">
              {emptyTable
                ? SCAN_EMPTY_COPY
                : sheet.kind === "paper"
                  ? `Pick the file on this stall. ${SCAN_PAPER_COPY}`
                  : `Pick the paper on this stall. ${SCAN_FILE_COPY}`}
            </p>
          )}
        </article>

        <div className="space-y-4">
          {paired ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Scan the liner"
              title={SCAN_TABLE_LINE}
              body={`${SCAN_TOTE_LINE} ${SCAN_MATE_LINE}`}
            />
          ) : emptyTable ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="This table only"
              title={SCAN_EMPTY_COPY}
              body={`${SCAN_STALL_COPY} ${SCAN_TOTE_LINE}`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow={sheet.kind === "paper" ? "This tape only" : "This file only"}
              title="Nobody taped a scan yet."
              body={`${SCAN_MATE_LINE} ${SCAN_WITH_LINE}`}
            />
          )}

          {emptyTable ? null : (
            <ScanForm
              listingId={sheet.listingId}
              mateId={sheet.mateId}
              mates={sheet.mates}
              hostKind={sheet.kind}
            />
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            {sheet.mate ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                render={<Link href={listingPath(sheet.mate.id)} />}
              >
                Open the mate
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                render={<Link href={stallHref} />}
              >
                Open the stall
              </Button>
            ) : null}
          </div>
        </div>
      </MallSection>
    </div>
  );
}