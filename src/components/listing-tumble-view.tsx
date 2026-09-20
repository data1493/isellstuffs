import Link from "next/link";

import { ListingTumbleEmpty } from "@/components/listing-tumble-empty";
import { SyncTumble } from "@/components/listing-tumble-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TUMBLE_CRACK_LINE,
  TUMBLE_EMPTY_CASES_LINE,
  TUMBLE_LEAVE_LINE,
  TUMBLE_MIRROR_SCRIPT,
  TUMBLE_NOTICE_TITLE,
  TUMBLE_REFUSE_COPY,
  TUMBLE_STAYS_LINE,
  TUMBLE_STILL_LINE,
  TUMBLE_TABLE_LINE,
  TUMBLE_TOTE_LINE,
  TUMBLE_WALK_LINE,
} from "@/lib/listing-tumble";
import { listingPath, listingTumbleWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TumbleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "liner"
  | "chair"
  | "owned";

export type TumbleViewSheet = {
  kind: TumbleViewKind;
  listingId: string;
  isTumble: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TumbleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TUMBLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TumbleRefused({ sheet }: { sheet: TumbleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const liner = sheet.kind === "liner";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-tumble-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : liner
                ? "A liner is not a pile"
                : chair
                  ? "A chair is not a pile"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={TUMBLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A tumble note is for empty jewels on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TUMBLE_TABLE_LINE} {TUMBLE_EMPTY_CASES_LINE} {TUMBLE_CRACK_LINE}{" "}
              {TUMBLE_STILL_LINE}
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

function TumbleForm({
  listingId,
  isTumble,
}: {
  listingId: string;
  isTumble: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTumbleWritePath()}
      className="space-y-3"
      data-tumble-form={isTumble ? "open" : "tumble"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTumble ? "open" : "tumble"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/tumble`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTumble ? TUMBLE_LEAVE_LINE : TUMBLE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTumble
          ? "Clear the tape. Status and the tote stay put."
          : `${TUMBLE_STAYS_LINE} ${TUMBLE_EMPTY_CASES_LINE} ${TUMBLE_CRACK_LINE} ${TUMBLE_STILL_LINE} ${TUMBLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTumbleView({
  sheet,
  tumbleIds,
}: {
  sheet: TumbleViewSheet;
  tumbleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TumbleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TumbleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-tumble-sheet="physical"
      data-tumble-state={sheet.isTumble ? "tumble" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TUMBLE_MIRROR_SCRIPT }} />
      <SyncTumble listingIds={tumbleIds} />

      <MallHero>
        <MallCrumb label="I will not tumble them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tumble</span>
        </MallCrumb>

        <MallEyebrow>I will not tumble them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTumble ? TUMBLE_NOTICE_TITLE : TUMBLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TUMBLE_TABLE_LINE} {TUMBLE_EMPTY_CASES_LINE} {TUMBLE_CRACK_LINE}{" "}
            {TUMBLE_WALK_LINE} {TUMBLE_STAYS_LINE} {TUMBLE_STILL_LINE}{" "}
            {TUMBLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-tumble-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTumble ? (
              <Badge variant="outline">I will not tumble them</Badge>
            ) : (
              <Badge variant="ghost">Tumble not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tumble paper
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
            {sheet.isTumble
              ? "Still for sale. Seller taped the tumble note. Status stays available. Not a closer."
              : "Still empty. Still cracked. Tape it when walkers still want the plastics rolled."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTumble ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not tumble them"
              title={TUMBLE_NOTICE_TITLE}
              body={`${TUMBLE_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingTumbleEmpty listingId={sheet.listingId} />
          )}

          <TumbleForm listingId={sheet.listingId} isTumble={sheet.isTumble} />

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
