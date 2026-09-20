import Link from "next/link";

import { ListingLoomEmpty } from "@/components/listing-loom-empty";
import { SyncLoom } from "@/components/listing-loom-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LOOM_ENDS_LINE,
  LOOM_LEAVE_LINE,
  LOOM_MIRROR_SCRIPT,
  LOOM_NOTICE_TITLE,
  LOOM_REFUSE_COPY,
  LOOM_STAYS_LINE,
  LOOM_STILL_LINE,
  LOOM_TABLE_LINE,
  LOOM_TANGLE_LINE,
  LOOM_TOTE_LINE,
  LOOM_WALK_LINE,
} from "@/lib/listing-loom";
import { listingLoomWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LoomViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "boy"
  | "cdr"
  | "chair"
  | "owned";

export type LoomViewSheet = {
  kind: LoomViewKind;
  listingId: string;
  isLoom: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LoomMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LOOM_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LoomRefused({ sheet }: { sheet: LoomViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const boy = sheet.kind === "boy";
  const cdr = sheet.kind === "cdr";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-loom-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : boy
                ? "A Game Boy is not a cable pile"
                : cdr
                  ? "A burned disc is not a cable pile"
                  : chair
                    ? "A chair is not a cable pile"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={LOOM_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A loom note is for the mystery cable drawer on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {LOOM_TABLE_LINE} {LOOM_TANGLE_LINE} {LOOM_ENDS_LINE}{" "}
              {LOOM_STILL_LINE}
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

function LoomForm({
  listingId,
  isLoom,
}: {
  listingId: string;
  isLoom: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLoomWritePath()}
      className="space-y-3"
      data-loom-form={isLoom ? "open" : "loom"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isLoom ? "open" : "loom"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/loom`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isLoom ? LOOM_LEAVE_LINE : LOOM_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isLoom
          ? "Clear the tape. Status and the tote stay put."
          : `${LOOM_STAYS_LINE} ${LOOM_TANGLE_LINE} ${LOOM_ENDS_LINE} ${LOOM_STILL_LINE} ${LOOM_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingLoomView({
  sheet,
  loomIds,
}: {
  sheet: LoomViewSheet;
  loomIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LoomMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LoomRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-loom-sheet="physical"
      data-loom-state={sheet.isLoom ? "loom" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: LOOM_MIRROR_SCRIPT }} />
      <SyncLoom listingIds={loomIds} />

      <MallHero>
        <MallCrumb label="I will not loom them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Loom</span>
        </MallCrumb>

        <MallEyebrow>I will not loom them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isLoom ? LOOM_NOTICE_TITLE : LOOM_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LOOM_TABLE_LINE} {LOOM_TANGLE_LINE} {LOOM_ENDS_LINE}{" "}
            {LOOM_WALK_LINE} {LOOM_STAYS_LINE} {LOOM_STILL_LINE}{" "}
            {LOOM_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-loom-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isLoom ? (
              <Badge variant="outline">I will not loom them</Badge>
            ) : (
              <Badge variant="ghost">Loom not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Loom paper
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
            {sheet.isLoom
              ? "Still for sale. Seller taped the loom note. Status stays available. Not a shop."
              : "Still a tangle. Still some ends honest. Tape it when walkers still want the pile sleeved."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isLoom ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not loom them"
              title={LOOM_NOTICE_TITLE}
              body={`${LOOM_STILL_LINE} avail=open still lists this drawer.`}
            />
          ) : (
            <ListingLoomEmpty listingId={sheet.listingId} />
          )}

          <LoomForm listingId={sheet.listingId} isLoom={sheet.isLoom} />

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
