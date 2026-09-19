import Link from "next/link";

import { ListingLinkEmpty } from "@/components/listing-link-empty";
import { SyncLink } from "@/components/listing-link-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  LINK_BRICK_LINE,
  LINK_MIRROR_SCRIPT,
  LINK_NOTICE_TITLE,
  LINK_REFUSE_COPY,
  LINK_STAYS_LINE,
  LINK_STILL_LINE,
  LINK_TABLE_LINE,
  LINK_TOTE_LINE,
  LINK_WALK_LINE,
} from "@/lib/listing-link";
import { listingLinkWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type LinkViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type LinkViewSheet = {
  kind: LinkViewKind;
  listingId: string;
  isLink: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function LinkMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={LINK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function LinkRefused({ sheet }: { sheet: LinkViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-link-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={LINK_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A link note is for a brick on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {LINK_TABLE_LINE} {LINK_BRICK_LINE} {LINK_STILL_LINE}
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

function LinkForm({
  listingId,
  isLink,
}: {
  listingId: string;
  isLink: boolean;
}) {
  return (
    <form
      method="post"
      action={listingLinkWritePath()}
      className="space-y-3"
      data-link-form={isLink ? "open" : "link"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isLink ? "open" : "link"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/link`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isLink ? "Leave the brick" : "I don't have a link"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isLink
          ? "Clear the tape. Status and the tote stay put."
          : `${LINK_STAYS_LINE} ${LINK_BRICK_LINE} ${LINK_STILL_LINE} ${LINK_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingLinkView({
  sheet,
  linkIds,
}: {
  sheet: LinkViewSheet;
  linkIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <LinkMissing />;
  }

  if (sheet.kind !== "physical") {
    return <LinkRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-link-sheet="physical"
      data-link-state={sheet.isLink ? "link" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: LINK_MIRROR_SCRIPT }} />
      <SyncLink listingIds={linkIds} />

      <MallHero>
        <MallCrumb label="I don't have a link">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Link</span>
        </MallCrumb>

        <MallEyebrow>I don't have a link</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isLink ? LINK_NOTICE_TITLE : LINK_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {LINK_TABLE_LINE} {LINK_BRICK_LINE} {LINK_WALK_LINE}{" "}
            {LINK_STAYS_LINE} {LINK_STILL_LINE} {LINK_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-link-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isLink ? (
              <Badge variant="outline">I don't have a link</Badge>
            ) : (
              <Badge variant="ghost">Link not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Link paper
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
            {sheet.isLink
              ? "Still for sale. Seller taped the link note. Status stays available. Not a Nintendo desk."
              : "One brick. Still for sale. Tape it when walkers still want a second player."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isLink ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have a link"
              title={LINK_NOTICE_TITLE}
              body={`${LINK_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingLinkEmpty listingId={sheet.listingId} />
          )}

          <LinkForm listingId={sheet.listingId} isLink={sheet.isLink} />

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
