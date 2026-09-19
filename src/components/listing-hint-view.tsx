import Link from "next/link";

import { ListingHintEmpty } from "@/components/listing-hint-empty";
import { SyncHint } from "@/components/listing-hint-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HINT_MAP_LINE,
  HINT_MIRROR_SCRIPT,
  HINT_NOTICE_TITLE,
  HINT_REFUSE_COPY,
  HINT_STAYS_LINE,
  HINT_STILL_LINE,
  HINT_TABLE_LINE,
  HINT_TOTE_LINE,
  HINT_WALK_LINE,
  HINT_WEIGHTS_LINE,
} from "@/lib/listing-hint";
import { listingHintWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HintViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type HintViewSheet = {
  kind: HintViewKind;
  listingId: string;
  isHint: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HintMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HINT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HintRefused({ sheet }: { sheet: HintViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-hint-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={HINT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Hint honesty is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {HINT_NOTICE_TITLE} {HINT_WALK_LINE} {HINT_STILL_LINE}
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

function HintForm({
  listingId,
  isHint,
}: {
  listingId: string;
  isHint: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHintWritePath()}
      className="space-y-3"
      data-hint-form={isHint ? "open" : "hint"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHint ? "open" : "hint"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/hint`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHint ? "Leave the two weights" : "I will not hint it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHint
          ? "Clear the hint paper. Status and the tote stay put."
          : `${HINT_STAYS_LINE} ${HINT_WEIGHTS_LINE} ${HINT_MAP_LINE} ${HINT_STILL_LINE} ${HINT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingHintView({
  sheet,
  hintIds,
}: {
  sheet: HintViewSheet;
  hintIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HintMissing />;
  }

  if (sheet.kind !== "digital") {
    return <HintRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-hint-sheet="digital"
      data-hint-state={sheet.isHint ? "hint" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HINT_MIRROR_SCRIPT }} />
      <SyncHint listingIds={hintIds} />

      <MallHero>
        <MallCrumb label="I will not hint it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Hint</span>
        </MallCrumb>

        <MallEyebrow>I will not hint it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHint ? HINT_NOTICE_TITLE : HINT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HINT_NOTICE_TITLE} {HINT_WALK_LINE} {HINT_STILL_LINE}{" "}
            {HINT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-hint-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isHint ? (
              <Badge variant="outline">I will not hint it</Badge>
            ) : (
              <Badge variant="ghost">Two weights</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Hint paper
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
            {sheet.isHint
              ? "Still for sale. Seller taped that the file stays two weights. Still a map. Walkers still ask Beats to hint the OTF. Status stays available."
              : "Two weights. Still a map. Tape it when walkers still want a hinted webfont."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHint ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not hint it"
              title={HINT_NOTICE_TITLE}
              body={`${HINT_STILL_LINE} avail=open still lists this file. ${HINT_WEIGHTS_LINE} ${HINT_MAP_LINE}`}
            />
          ) : (
            <ListingHintEmpty listingId={sheet.listingId} />
          )}

          <HintForm listingId={sheet.listingId} isHint={sheet.isHint} />

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
