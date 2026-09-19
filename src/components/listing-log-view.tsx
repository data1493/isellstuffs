import Link from "next/link";

import { ListingLogEmpty } from "@/components/listing-log-empty";
import { SyncLog } from "@/components/listing-log-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LOG_CONVERT_LINE,
  LOG_CUBES_LINE,
  LOG_LOOKS_LINE,
  LOG_MIRROR_SCRIPT,
  LOG_NOTICE_TITLE,
  LOG_REFUSE_COPY,
  LOG_STILL_LINE,
  LOG_TOTE_LINE,
  LOG_WALK_LINE,
} from "@/lib/listing-log";
import { listingLogWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LogViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LogViewSheet = {
  kind: LogViewKind;
  listingId: string;
  isLog: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LogMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LOG_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button
          className="h-11 w-full rounded-full px-5 sm:w-auto"
          render={<Link href="/explore" />}
        >
          Walk the concourse
        </Button>
      }
    />
  );
}

function LogRefused({ sheet }: { sheet: LogViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-log-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={LOG_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not unlog is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {LOG_NOTICE_TITLE} {LOG_CONVERT_LINE} {LOG_WALK_LINE}{" "}
              {LOG_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="h-11 w-full rounded-full px-5 sm:w-auto"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="h-11 w-full rounded-full px-5 sm:w-auto"
              render={<Link href="/explore" />}
            >
              Walk the concourse
            </Button>
          </>
        }
      />
    </div>
  );
}

function LogForm({
  listingId,
  isLog,
}: {
  listingId: string;
  isLog: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLogWritePath()}
      className="space-y-3"
      data-log-form={isLog ? "open" : "log"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isLog ? "open" : "log"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/log`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isLog ? "Leave the parking-lot looks" : "I will not unlog"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isLog
          ? "Clear the tape. Status and the tote stay put."
          : `${LOG_LOOKS_LINE} ${LOG_CUBES_LINE} ${LOG_CONVERT_LINE} ${LOG_WALK_LINE} ${LOG_STILL_LINE} ${LOG_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingLogView({
  sheet,
  logIds,
}: {
  sheet: LogViewSheet;
  logIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LogMissing />;
  }

  if (sheet.kind !== "digital") {
    return <LogRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-log-sheet="digital"
      data-log-state={sheet.isLog ? "log" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: LOG_MIRROR_SCRIPT }} />
      <SyncLog listingIds={logIds} />

      <MallHero>
        <MallCrumb label="I will not unlog">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Log</span>
        </MallCrumb>

        <MallEyebrow>I will not unlog</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isLog ? LOG_NOTICE_TITLE : "I will not unlog."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LOG_NOTICE_TITLE} {LOG_CONVERT_LINE} {LOG_WALK_LINE}{" "}
            {LOG_STILL_LINE} {LOG_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-log-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isLog ? (
              <Badge variant="outline">Parking-lot looks</Badge>
            ) : (
              <Badge variant="ghost">Open to log</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Log paper
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

          <p className="mt-5 text-sm leading-6 text-foreground">
            {sheet.isLog
              ? "Still for sale. Seller taped that they will not unlog. Walkers still ask Half-Working for Rec.709-ready cubes. Status stays available."
              : "Parking-lot looks. Still three cubes. Tape it when walkers still want them unlogged."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isLog ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not unlog"
              title={LOG_NOTICE_TITLE}
              body={`${LOG_STILL_LINE} avail=open still lists this file. ${LOG_LOOKS_LINE} ${LOG_CUBES_LINE}`}
            />
          ) : (
            <ListingLogEmpty listingId={sheet.listingId} />
          )}

          <LogForm listingId={sheet.listingId} isLog={sheet.isLog} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="h-11 w-full rounded-full sm:w-auto"
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
