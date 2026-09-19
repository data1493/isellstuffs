import Link from "next/link";

import { ListingAzimuthEmpty } from "@/components/listing-azimuth-empty";
import { SyncAzimuth } from "@/components/listing-azimuth-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  AZIMUTH_HISS_LINE,
  AZIMUTH_LEAVE_LINE,
  AZIMUTH_MIRROR_SCRIPT,
  AZIMUTH_NINETY_LINE,
  AZIMUTH_NOTICE_TITLE,
  AZIMUTH_REFUSE_COPY,
  AZIMUTH_STAYS_LINE,
  AZIMUTH_STILL_LINE,
  AZIMUTH_TABLE_LINE,
  AZIMUTH_TOTE_LINE,
  AZIMUTH_WALK_LINE,
} from "@/lib/listing-azimuth";
import { listingAzimuthWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type AzimuthViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lp"
  | "owned";

export type AzimuthViewSheet = {
  kind: AzimuthViewKind;
  listingId: string;
  isAzimuth: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function AzimuthMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={AZIMUTH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function AzimuthRefused({ sheet }: { sheet: AzimuthViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const owned = sheet.kind === "owned";

  return (
    <div data-azimuth-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lp
                ? "A record is not a heading"
                : owned
                  ? "Another note already owns that one"
                  : "Walked"
        }
        title={AZIMUTH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An azimuth note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {AZIMUTH_TABLE_LINE} {AZIMUTH_HISS_LINE} {AZIMUTH_NINETY_LINE}{" "}
              {AZIMUTH_STILL_LINE}
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

function AzimuthForm({
  listingId,
  isAzimuth,
}: {
  listingId: string;
  isAzimuth: boolean;
}) {
  return (
    <form
      method="post"
      action={listingAzimuthWritePath()}
      className="space-y-3"
      data-azimuth-form={isAzimuth ? "open" : "azimuth"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isAzimuth ? "open" : "azimuth"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/azimuth`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isAzimuth ? AZIMUTH_LEAVE_LINE : AZIMUTH_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isAzimuth
          ? "Clear the tape. Status and the tote stay put."
          : `${AZIMUTH_STAYS_LINE} ${AZIMUTH_HISS_LINE} ${AZIMUTH_NINETY_LINE} ${AZIMUTH_STILL_LINE} ${AZIMUTH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingAzimuthView({
  sheet,
  azimuthIds,
}: {
  sheet: AzimuthViewSheet;
  azimuthIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <AzimuthMissing />;
  }

  if (sheet.kind !== "physical") {
    return <AzimuthRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-azimuth-sheet="physical"
      data-azimuth-state={sheet.isAzimuth ? "azimuth" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: AZIMUTH_MIRROR_SCRIPT }} />
      <SyncAzimuth listingIds={azimuthIds} />

      <MallHero>
        <MallCrumb label="I will not azimuth it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Azimuth</span>
        </MallCrumb>

        <MallEyebrow>I will not azimuth it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isAzimuth ? AZIMUTH_NOTICE_TITLE : AZIMUTH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {AZIMUTH_TABLE_LINE} {AZIMUTH_HISS_LINE} {AZIMUTH_NINETY_LINE}{" "}
            {AZIMUTH_WALK_LINE} {AZIMUTH_STAYS_LINE} {AZIMUTH_STILL_LINE}{" "}
            {AZIMUTH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-azimuth-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isAzimuth ? (
              <Badge variant="outline">I will not azimuth it</Badge>
            ) : (
              <Badge variant="ghost">Azimuth not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Azimuth paper
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
            {sheet.isAzimuth
              ? "Still for sale. Seller taped the azimuth note. Status stays available. Not a deck."
              : "Still hiss. Still 93. Tape it when walkers still want the heading set."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isAzimuth ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not azimuth it"
              title={AZIMUTH_NOTICE_TITLE}
              body={`${AZIMUTH_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingAzimuthEmpty listingId={sheet.listingId} />
          )}

          <AzimuthForm listingId={sheet.listingId} isAzimuth={sheet.isAzimuth} />

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
