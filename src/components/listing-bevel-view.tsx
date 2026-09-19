import Link from "next/link";

import { ListingBevelEmpty } from "@/components/listing-bevel-empty";
import { SyncBevel } from "@/components/listing-bevel-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BEVEL_LEAVE_LINE,
  BEVEL_MIRROR_SCRIPT,
  BEVEL_NOTICE_TITLE,
  BEVEL_REFUSE_COPY,
  BEVEL_SCRATCHED_LINE,
  BEVEL_SHARPIE_LINE,
  BEVEL_STAYS_LINE,
  BEVEL_STILL_LINE,
  BEVEL_TABLE_LINE,
  BEVEL_TOTE_LINE,
  BEVEL_WALK_LINE,
} from "@/lib/listing-bevel";
import { listingBevelWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BevelViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "font"
  | "chair"
  | "owned";

export type BevelViewSheet = {
  kind: BevelViewKind;
  listingId: string;
  isBevel: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BevelMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BEVEL_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BevelRefused({ sheet }: { sheet: BevelViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const pack = sheet.kind === "pack";
  const font = sheet.kind === "font";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-bevel-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : pack
                ? "A pack is not a disc"
                : font
                  ? "A font is not a disc"
                  : chair
                    ? "A chair is not a disc"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={BEVEL_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A bevel note is for a disc on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BEVEL_TABLE_LINE} {BEVEL_SCRATCHED_LINE} {BEVEL_SHARPIE_LINE}{" "}
              {BEVEL_STILL_LINE}
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

function BevelForm({
  listingId,
  isBevel,
}: {
  listingId: string;
  isBevel: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBevelWritePath()}
      className="space-y-3"
      data-bevel-form={isBevel ? "open" : "bevel"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBevel ? "open" : "bevel"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/bevel`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBevel ? BEVEL_LEAVE_LINE : BEVEL_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBevel
          ? "Clear the tape. Status and the tote stay put."
          : `${BEVEL_STAYS_LINE} ${BEVEL_SCRATCHED_LINE} ${BEVEL_SHARPIE_LINE} ${BEVEL_STILL_LINE} ${BEVEL_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBevelView({
  sheet,
  bevelIds,
}: {
  sheet: BevelViewSheet;
  bevelIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BevelMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BevelRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-bevel-sheet="physical"
      data-bevel-state={sheet.isBevel ? "bevel" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BEVEL_MIRROR_SCRIPT }} />
      <SyncBevel listingIds={bevelIds} />

      <MallHero>
        <MallCrumb label="I will not bevel it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Bevel</span>
        </MallCrumb>

        <MallEyebrow>I will not bevel it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBevel ? BEVEL_NOTICE_TITLE : BEVEL_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BEVEL_TABLE_LINE} {BEVEL_SCRATCHED_LINE} {BEVEL_SHARPIE_LINE}{" "}
            {BEVEL_WALK_LINE} {BEVEL_STAYS_LINE} {BEVEL_STILL_LINE}{" "}
            {BEVEL_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-bevel-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBevel ? (
              <Badge variant="outline">I will not bevel it</Badge>
            ) : (
              <Badge variant="ghost">Bevel not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Bevel paper
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
            {sheet.isBevel
              ? "Still for sale. Seller taped the bevel note. Status stays available. Not a shop."
              : "Still scratched. Still Sharpie. Tape it when walkers still want the outer dressed so it doesn’t catch the tray."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBevel ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not bevel it"
              title={BEVEL_NOTICE_TITLE}
              body={`${BEVEL_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingBevelEmpty listingId={sheet.listingId} />
          )}

          <BevelForm listingId={sheet.listingId} isBevel={sheet.isBevel} />

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
