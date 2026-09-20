import Link from "next/link";

import { ListingAntiskateEmpty } from "@/components/listing-antiskate-empty";
import { SyncAntiskate } from "@/components/listing-antiskate-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ANTISKATE_LEAVE_LINE,
  ANTISKATE_MIRROR_SCRIPT,
  ANTISKATE_NOTICE_TITLE,
  ANTISKATE_REFUSE_COPY,
  ANTISKATE_SKIP_LINE,
  ANTISKATE_STAYS_LINE,
  ANTISKATE_STILL_LINE,
  ANTISKATE_TABLE_LINE,
  ANTISKATE_TOTE_LINE,
  ANTISKATE_UNNAMED_LINE,
  ANTISKATE_WALK_LINE,
} from "@/lib/listing-antiskate";
import { listingAntiskateWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type AntiskateViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

export type AntiskateViewSheet = {
  kind: AntiskateViewKind;
  listingId: string;
  isAntiskate: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function AntiskateMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ANTISKATE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function AntiskateRefused({ sheet }: { sheet: AntiskateViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mixtape = sheet.kind === "mixtape";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-antiskate-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mixtape
                ? "A mixtape is not an LP"
                : jewels
                  ? "Empty jewels are not an LP"
                  : chair
                    ? "A chair is not an LP"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={ANTISKATE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An antiskate note is for the unnamed LP on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {ANTISKATE_TABLE_LINE} {ANTISKATE_SKIP_LINE} {ANTISKATE_UNNAMED_LINE}{" "}
              {ANTISKATE_STILL_LINE}
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

function AntiskateForm({
  listingId,
  isAntiskate,
}: {
  listingId: string;
  isAntiskate: boolean;
}) {
  return (
    <form
      method="post"
      action={listingAntiskateWritePath()}
      className="space-y-3"
      data-antiskate-form={isAntiskate ? "open" : "antiskate"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isAntiskate ? "open" : "antiskate"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/antiskate`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isAntiskate ? ANTISKATE_LEAVE_LINE : ANTISKATE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isAntiskate
          ? "Clear the tape. Status and the tote stay put."
          : `${ANTISKATE_STAYS_LINE} ${ANTISKATE_SKIP_LINE} ${ANTISKATE_UNNAMED_LINE} ${ANTISKATE_STILL_LINE} ${ANTISKATE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingAntiskateView({
  sheet,
  antiskateIds,
}: {
  sheet: AntiskateViewSheet;
  antiskateIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <AntiskateMissing />;
  }

  if (sheet.kind !== "physical") {
    return <AntiskateRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-antiskate-sheet="physical"
      data-antiskate-state={sheet.isAntiskate ? "antiskate" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ANTISKATE_MIRROR_SCRIPT }} />
      <SyncAntiskate listingIds={antiskateIds} />

      <MallHero>
        <MallCrumb label="I will not antiskate it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Antiskate</span>
        </MallCrumb>

        <MallEyebrow>I will not antiskate it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isAntiskate ? ANTISKATE_NOTICE_TITLE : ANTISKATE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ANTISKATE_TABLE_LINE} {ANTISKATE_SKIP_LINE} {ANTISKATE_UNNAMED_LINE}{" "}
            {ANTISKATE_WALK_LINE} {ANTISKATE_STAYS_LINE} {ANTISKATE_STILL_LINE}{" "}
            {ANTISKATE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-antiskate-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isAntiskate ? (
              <Badge variant="outline">I will not antiskate it</Badge>
            ) : (
              <Badge variant="ghost">Antiskate not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Antiskate paper
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
            {sheet.isAntiskate
              ? "Still for sale. Seller taped the antiskate note. Status stays available. Not a shop."
              : "Still a skip. Still unnamed. Tape it when walkers still want shop anti-skate."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isAntiskate ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not antiskate it"
              title={ANTISKATE_NOTICE_TITLE}
              body={`${ANTISKATE_STILL_LINE} avail=open still lists this LP.`}
            />
          ) : (
            <ListingAntiskateEmpty listingId={sheet.listingId} />
          )}

          <AntiskateForm listingId={sheet.listingId} isAntiskate={sheet.isAntiskate} />

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
