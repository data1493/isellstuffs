import Link from "next/link";

import { ListingReflowEmpty } from "@/components/listing-reflow-empty";
import { SyncReflow } from "@/components/listing-reflow-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  REFLOW_FUSED_LINE,
  REFLOW_LEAVE_LINE,
  REFLOW_LINE_LINE,
  REFLOW_MIRROR_SCRIPT,
  REFLOW_NOTICE_TITLE,
  REFLOW_REFUSE_COPY,
  REFLOW_STAYS_LINE,
  REFLOW_STILL_LINE,
  REFLOW_TABLE_LINE,
  REFLOW_TOTE_LINE,
  REFLOW_WALK_LINE,
} from "@/lib/listing-reflow";
import { listingPath, listingReflowWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ReflowViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lut"
  | "pack"
  | "owned";

export type ReflowViewSheet = {
  kind: ReflowViewKind;
  listingId: string;
  isReflow: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ReflowMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={REFLOW_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ReflowRefused({ sheet }: { sheet: ReflowViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lut = sheet.kind === "lut";
  const pack = sheet.kind === "pack";
  const owned = sheet.kind === "owned";

  return (
    <div data-reflow-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : lut
              ? "A LUT is not a cart"
              : pack
                ? "A pack is not a cart"
                : file
                  ? "Files stay in the folder"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={REFLOW_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A reflow note is for the cracked Game Boy on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {REFLOW_TABLE_LINE} {REFLOW_LINE_LINE} {REFLOW_FUSED_LINE}{" "}
              {REFLOW_STILL_LINE}
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

function ReflowForm({
  listingId,
  isReflow,
}: {
  listingId: string;
  isReflow: boolean;
}) {
  return (
    <form
      method="post"
      action={listingReflowWritePath()}
      className="space-y-3"
      data-reflow-form={isReflow ? "open" : "reflow"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isReflow ? "open" : "reflow"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/reflow`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isReflow ? REFLOW_LEAVE_LINE : REFLOW_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isReflow
          ? "Clear the tape. Status and the tote stay put."
          : `${REFLOW_STAYS_LINE} ${REFLOW_LINE_LINE} ${REFLOW_FUSED_LINE} ${REFLOW_STILL_LINE} ${REFLOW_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingReflowView({
  sheet,
  reflowIds,
}: {
  sheet: ReflowViewSheet;
  reflowIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ReflowMissing />;
  }

  if (sheet.kind !== "physical") {
    return <ReflowRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-reflow-sheet="physical"
      data-reflow-state={sheet.isReflow ? "reflow" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: REFLOW_MIRROR_SCRIPT }} />
      <SyncReflow listingIds={reflowIds} />

      <MallHero>
        <MallCrumb label="I will not reflow it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Reflow</span>
        </MallCrumb>

        <MallEyebrow>I will not reflow it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isReflow ? REFLOW_NOTICE_TITLE : REFLOW_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {REFLOW_TABLE_LINE} {REFLOW_LINE_LINE} {REFLOW_FUSED_LINE}{" "}
            {REFLOW_WALK_LINE} {REFLOW_STAYS_LINE} {REFLOW_STILL_LINE}{" "}
            {REFLOW_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-reflow-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isReflow ? (
              <Badge variant="outline">I will not reflow it</Badge>
            ) : (
              <Badge variant="ghost">Reflow not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Reflow paper
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
            {sheet.isReflow
              ? "Still for sale. Seller taped the reflow note. Status stays available. Not a solder shop."
              : "Still a line. Still fused. Tape it when walkers still want the joints heated."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isReflow ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not reflow it"
              title={REFLOW_NOTICE_TITLE}
              body={`${REFLOW_STILL_LINE} avail=open still lists this Game Boy.`}
            />
          ) : (
            <ListingReflowEmpty listingId={sheet.listingId} />
          )}

          <ReflowForm listingId={sheet.listingId} isReflow={sheet.isReflow} />

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
