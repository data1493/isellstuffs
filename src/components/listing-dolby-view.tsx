import Link from "next/link";

import { ListingDolbyEmpty } from "@/components/listing-dolby-empty";
import { SyncDolby } from "@/components/listing-dolby-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  DOLBY_HISS_LINE,
  DOLBY_LEAVE_LINE,
  DOLBY_MIRROR_SCRIPT,
  DOLBY_NOTICE_TITLE,
  DOLBY_REFUSE_COPY,
  DOLBY_STAYS_LINE,
  DOLBY_STILL_LINE,
  DOLBY_SUMMER_LINE,
  DOLBY_TABLE_LINE,
  DOLBY_TOTE_LINE,
  DOLBY_WALK_LINE,
} from "@/lib/listing-dolby";
import { listingDolbyWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type DolbyViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lp"
  | "cdr"
  | "chair"
  | "owned";

export type DolbyViewSheet = {
  kind: DolbyViewKind;
  listingId: string;
  isDolby: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function DolbyMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={DOLBY_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function DolbyRefused({ sheet }: { sheet: DolbyViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const cdr = sheet.kind === "cdr";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-dolby-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lp
                ? "A record is not a cassette"
                : cdr
                  ? "A disc is not a cassette"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={DOLBY_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A Dolby note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {DOLBY_TABLE_LINE} {DOLBY_HISS_LINE} {DOLBY_SUMMER_LINE}{" "}
              {DOLBY_STILL_LINE}
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

function DolbyForm({
  listingId,
  isDolby,
}: {
  listingId: string;
  isDolby: boolean;
}) {
  return (
    <form
      method="post"
      action={listingDolbyWritePath()}
      className="space-y-3"
      data-dolby-form={isDolby ? "open" : "dolby"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isDolby ? "open" : "dolby"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/dolby`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isDolby ? DOLBY_LEAVE_LINE : DOLBY_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isDolby
          ? "Clear the tape. Status and the tote stay put."
          : `${DOLBY_STAYS_LINE} ${DOLBY_HISS_LINE} ${DOLBY_SUMMER_LINE} ${DOLBY_STILL_LINE} ${DOLBY_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingDolbyView({
  sheet,
  dolbyIds,
}: {
  sheet: DolbyViewSheet;
  dolbyIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <DolbyMissing />;
  }

  if (sheet.kind !== "physical") {
    return <DolbyRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-dolby-sheet="physical"
      data-dolby-state={sheet.isDolby ? "dolby" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: DOLBY_MIRROR_SCRIPT }} />
      <SyncDolby listingIds={dolbyIds} />

      <MallHero>
        <MallCrumb label="I will not Dolby it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Dolby</span>
        </MallCrumb>

        <MallEyebrow>I will not Dolby it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isDolby ? DOLBY_NOTICE_TITLE : DOLBY_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {DOLBY_TABLE_LINE} {DOLBY_HISS_LINE} {DOLBY_SUMMER_LINE}{" "}
            {DOLBY_WALK_LINE} {DOLBY_STAYS_LINE} {DOLBY_STILL_LINE}{" "}
            {DOLBY_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-dolby-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isDolby ? (
              <Badge variant="outline">I will not Dolby it</Badge>
            ) : (
              <Badge variant="ghost">Dolby not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Dolby paper
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
            {sheet.isDolby
              ? "Still for sale. Seller taped the Dolby note. Status stays available. Not a shop."
              : "Still hiss. Still SUMMER 93. Tape it when walkers still want the hiss encoded."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isDolby ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not Dolby it"
              title={DOLBY_NOTICE_TITLE}
              body={`${DOLBY_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingDolbyEmpty listingId={sheet.listingId} />
          )}

          <DolbyForm listingId={sheet.listingId} isDolby={sheet.isDolby} />

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
