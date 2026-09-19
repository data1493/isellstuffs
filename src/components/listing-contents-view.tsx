import Link from "next/link";

import { ListingContentsEmpty } from "@/components/listing-contents-empty";
import { SyncContents } from "@/components/listing-contents-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CONTENTS_LEAVE_LINE,
  CONTENTS_MIRROR_SCRIPT,
  CONTENTS_NOTICE_TITLE,
  CONTENTS_REFUSE_COPY,
  CONTENTS_SCRATCHED_LINE,
  CONTENTS_SHARPIE_LINE,
  CONTENTS_STAYS_LINE,
  CONTENTS_STILL_LINE,
  CONTENTS_TABLE_LINE,
  CONTENTS_TOTE_LINE,
  CONTENTS_WALK_LINE,
} from "@/lib/listing-contents";
import { listingContentsWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ContentsViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ContentsViewSheet = {
  kind: ContentsViewKind;
  listingId: string;
  isContents: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ContentsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CONTENTS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ContentsRefused({ sheet }: { sheet: ContentsViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-contents-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={CONTENTS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A contents note is for a disc on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {CONTENTS_TABLE_LINE} {CONTENTS_SHARPIE_LINE} {CONTENTS_SCRATCHED_LINE}{" "}
              {CONTENTS_STILL_LINE}
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

function ContentsForm({
  listingId,
  isContents,
}: {
  listingId: string;
  isContents: boolean;
}) {
  return (
    <form
      method="post"
      action={listingContentsWritePath()}
      className="space-y-3"
      data-contents-form={isContents ? "open" : "contents"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isContents ? "open" : "contents"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/contents`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isContents ? CONTENTS_LEAVE_LINE : CONTENTS_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isContents
          ? "Clear the tape. Status and the tote stay put."
          : `${CONTENTS_STAYS_LINE} ${CONTENTS_SHARPIE_LINE} ${CONTENTS_SCRATCHED_LINE} ${CONTENTS_STILL_LINE} ${CONTENTS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingContentsView({
  sheet,
  contentsIds,
}: {
  sheet: ContentsViewSheet;
  contentsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ContentsMissing />;
  }

  if (sheet.kind !== "physical") {
    return <ContentsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-contents-sheet="physical"
      data-contents-state={sheet.isContents ? "contents" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CONTENTS_MIRROR_SCRIPT }} />
      <SyncContents listingIds={contentsIds} />

      <MallHero>
        <MallCrumb label="I will not list what’s on it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Contents</span>
        </MallCrumb>

        <MallEyebrow>I will not list what’s on it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isContents ? CONTENTS_NOTICE_TITLE : CONTENTS_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CONTENTS_TABLE_LINE} {CONTENTS_SHARPIE_LINE} {CONTENTS_SCRATCHED_LINE}{" "}
            {CONTENTS_WALK_LINE} {CONTENTS_STAYS_LINE} {CONTENTS_STILL_LINE}{" "}
            {CONTENTS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-contents-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isContents ? (
              <Badge variant="outline">I will not list what’s on it</Badge>
            ) : (
              <Badge variant="ghost">Contents not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Contents paper
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
            {sheet.isContents
              ? "Still for sale. Seller taped the contents note. Status stays available. Not a rip shop."
              : "Still Sharpie. Still scratched. Tape it when walkers still want what’s on the disc."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isContents ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not list what’s on it"
              title={CONTENTS_NOTICE_TITLE}
              body={`${CONTENTS_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingContentsEmpty listingId={sheet.listingId} />
          )}

          <ContentsForm listingId={sheet.listingId} isContents={sheet.isContents} />

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
