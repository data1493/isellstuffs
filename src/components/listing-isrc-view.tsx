import Link from "next/link";

import { ListingIsrcEmpty } from "@/components/listing-isrc-empty";
import { SyncIsrc } from "@/components/listing-isrc-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ISRC_JEWEL_LINE,
  ISRC_LEAVE_LINE,
  ISRC_MIRROR_SCRIPT,
  ISRC_NOTICE_TITLE,
  ISRC_REFUSE_COPY,
  ISRC_SHARPIE_LINE,
  ISRC_STAYS_LINE,
  ISRC_STILL_LINE,
  ISRC_TABLE_LINE,
  ISRC_TOTE_LINE,
  ISRC_WALK_LINE,
} from "@/lib/listing-isrc";
import { listingIsrcWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type IsrcViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "mixtape"
  | "font"
  | "chair"
  | "owned";

export type IsrcViewSheet = {
  kind: IsrcViewKind;
  listingId: string;
  isIsrc: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function IsrcMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ISRC_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function IsrcRefused({ sheet }: { sheet: IsrcViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const pack = sheet.kind === "pack";
  const mixtape = sheet.kind === "mixtape";
  const font = sheet.kind === "font";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-isrc-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : pack
              ? "A sample pack is not a disc"
              : mixtape
                ? "A mixtape is not a burned disc"
                : font
                  ? "A font is not a disc"
                  : chair
                    ? "A chair is not a disc"
                    : file
                      ? "Files stay in the folder"
                      : owned
                        ? "Another note already owns that one"
                        : "Walked"
        }
        title={ISRC_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An isrc note is for the burned CD-R on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {ISRC_TABLE_LINE} {ISRC_SHARPIE_LINE} {ISRC_JEWEL_LINE}{" "}
              {ISRC_STILL_LINE}
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

function IsrcForm({
  listingId,
  isIsrc,
}: {
  listingId: string;
  isIsrc: boolean;
}) {
  return (
    <form
      method="post"
      action={listingIsrcWritePath()}
      className="space-y-3"
      data-isrc-form={isIsrc ? "open" : "isrc"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isIsrc ? "open" : "isrc"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/isrc`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isIsrc ? ISRC_LEAVE_LINE : ISRC_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isIsrc
          ? "Clear the tape. Status and the tote stay put."
          : `${ISRC_STAYS_LINE} ${ISRC_SHARPIE_LINE} ${ISRC_JEWEL_LINE} ${ISRC_STILL_LINE} ${ISRC_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingIsrcView({
  sheet,
  isrcIds,
}: {
  sheet: IsrcViewSheet;
  isrcIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <IsrcMissing />;
  }

  if (sheet.kind !== "physical") {
    return <IsrcRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-isrc-sheet="physical"
      data-isrc-state={sheet.isIsrc ? "isrc" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ISRC_MIRROR_SCRIPT }} />
      <SyncIsrc listingIds={isrcIds} />

      <MallHero>
        <MallCrumb label="I will not isrc it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Isrc</span>
        </MallCrumb>

        <MallEyebrow>I will not isrc it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isIsrc ? ISRC_NOTICE_TITLE : ISRC_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ISRC_TABLE_LINE} {ISRC_SHARPIE_LINE} {ISRC_JEWEL_LINE}{" "}
            {ISRC_WALK_LINE} {ISRC_STAYS_LINE} {ISRC_STILL_LINE}{" "}
            {ISRC_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-isrc-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isIsrc ? (
              <Badge variant="outline">I will not isrc it</Badge>
            ) : (
              <Badge variant="ghost">Isrc not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Isrc paper
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
            {sheet.isIsrc
              ? "Still for sale. Seller taped the isrc note. Status stays available. Not a shop ISRC."
              : "Still Sharpie. Still a jewel case. Tape it when walkers still want shop ISRCs."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isIsrc ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not isrc it"
              title={ISRC_NOTICE_TITLE}
              body={`${ISRC_STILL_LINE} avail=open still lists this disc.`}
            />
          ) : (
            <ListingIsrcEmpty listingId={sheet.listingId} />
          )}

          <IsrcForm listingId={sheet.listingId} isIsrc={sheet.isIsrc} />

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
