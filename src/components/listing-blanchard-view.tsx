import Link from "next/link";

import { ListingBlanchardEmpty } from "@/components/listing-blanchard-empty";
import { SyncBlanchard } from "@/components/listing-blanchard-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BLANCHARD_LEAVE_LINE,
  BLANCHARD_LID_LINE,
  BLANCHARD_MIRROR_SCRIPT,
  BLANCHARD_NOTICE_TITLE,
  BLANCHARD_POT_LINE,
  BLANCHARD_REFUSE_COPY,
  BLANCHARD_STAYS_LINE,
  BLANCHARD_STILL_LINE,
  BLANCHARD_TABLE_LINE,
  BLANCHARD_TOTE_LINE,
  BLANCHARD_WALK_LINE,
} from "@/lib/listing-blanchard";
import { listingBlanchardWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BlanchardViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

export type BlanchardViewSheet = {
  kind: BlanchardViewKind;
  listingId: string;
  isBlanchard: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BlanchardMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BLANCHARD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BlanchardRefused({ sheet }: { sheet: BlanchardViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-blanchard-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a lid"
                : whisk
                  ? "A whisk is not a lid"
                  : chair
                    ? "A chair is not a lid"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={BLANCHARD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A blanchard note is for the pot lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BLANCHARD_TABLE_LINE} {BLANCHARD_LID_LINE} {BLANCHARD_POT_LINE}{" "}
              {BLANCHARD_STILL_LINE}
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

function BlanchardForm({
  listingId,
  isBlanchard,
}: {
  listingId: string;
  isBlanchard: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBlanchardWritePath()}
      className="space-y-3"
      data-blanchard-form={isBlanchard ? "open" : "blanchard"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isBlanchard ? "open" : "blanchard"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/blanchard`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBlanchard ? BLANCHARD_LEAVE_LINE : BLANCHARD_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBlanchard
          ? "Clear the tape. Status and the tote stay put."
          : `${BLANCHARD_STAYS_LINE} ${BLANCHARD_LID_LINE} ${BLANCHARD_POT_LINE} ${BLANCHARD_STILL_LINE} ${BLANCHARD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBlanchardView({
  sheet,
  blanchardIds,
}: {
  sheet: BlanchardViewSheet;
  blanchardIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BlanchardMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BlanchardRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-blanchard-sheet="physical"
      data-blanchard-state={sheet.isBlanchard ? "blanchard" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BLANCHARD_MIRROR_SCRIPT }} />
      <SyncBlanchard listingIds={blanchardIds} />

      <MallHero>
        <MallCrumb label="I will not blanchard it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Blanchard</span>
        </MallCrumb>

        <MallEyebrow>I will not blanchard it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBlanchard ? BLANCHARD_NOTICE_TITLE : BLANCHARD_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BLANCHARD_TABLE_LINE} {BLANCHARD_LID_LINE} {BLANCHARD_POT_LINE}{" "}
            {BLANCHARD_WALK_LINE} {BLANCHARD_STAYS_LINE} {BLANCHARD_STILL_LINE}{" "}
            {BLANCHARD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-blanchard-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBlanchard ? (
              <Badge variant="outline">I will not blanchard it</Badge>
            ) : (
              <Badge variant="ghost">Blanchard not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Blanchard paper
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
            {sheet.isBlanchard
              ? "Still for sale. Seller taped the blanchard note. Status stays available. Not a shop."
              : "Still a lid. Still no pot. Tape it when walkers still want a shop Blanchard grind of the lid."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBlanchard ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not blanchard it"
              title={BLANCHARD_NOTICE_TITLE}
              body={`${BLANCHARD_STILL_LINE} avail=open still lists this lid.`}
            />
          ) : (
            <ListingBlanchardEmpty listingId={sheet.listingId} />
          )}

          <BlanchardForm listingId={sheet.listingId} isBlanchard={sheet.isBlanchard} />

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
