import Link from "next/link";

import { ListingEccentricEmpty } from "@/components/listing-eccentric-empty";
import { SyncEccentric } from "@/components/listing-eccentric-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ECCENTRIC_LEAVE_LINE,
  ECCENTRIC_MIRROR_SCRIPT,
  ECCENTRIC_NOTICE_TITLE,
  ECCENTRIC_REFUSE_COPY,
  ECCENTRIC_SKIP_LINE,
  ECCENTRIC_STAYS_LINE,
  ECCENTRIC_STILL_LINE,
  ECCENTRIC_TABLE_LINE,
  ECCENTRIC_TOTE_LINE,
  ECCENTRIC_UNNAMED_LINE,
  ECCENTRIC_WALK_LINE,
} from "@/lib/listing-eccentric";
import { listingPath, listingEccentricWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type EccentricViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

export type EccentricViewSheet = {
  kind: EccentricViewKind;
  listingId: string;
  isEccentric: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function EccentricMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ECCENTRIC_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function EccentricRefused({ sheet }: { sheet: EccentricViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mixtape = sheet.kind === "mixtape";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-eccentric-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mixtape
                ? "A mixtape is not an LP"
                : jewels
                  ? "Empty jewels are not an LP"
                  : chair
                    ? "A chair is not an LP"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={ECCENTRIC_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An eccentric note is for the unnamed LP on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {ECCENTRIC_TABLE_LINE} {ECCENTRIC_SKIP_LINE} {ECCENTRIC_UNNAMED_LINE}{" "}
              {ECCENTRIC_STILL_LINE}
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

function EccentricForm({
  listingId,
  isEccentric,
}: {
  listingId: string;
  isEccentric: boolean;
}) {
  return (
    <form
      method="post"
      action={listingEccentricWritePath()}
      className="space-y-3"
      data-eccentric-form={isEccentric ? "open" : "eccentric"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isEccentric ? "open" : "eccentric"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/eccentric`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isEccentric ? ECCENTRIC_LEAVE_LINE : ECCENTRIC_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isEccentric
          ? "Clear the tape. Status and the tote stay put."
          : `${ECCENTRIC_STAYS_LINE} ${ECCENTRIC_SKIP_LINE} ${ECCENTRIC_UNNAMED_LINE} ${ECCENTRIC_STILL_LINE} ${ECCENTRIC_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingEccentricView({
  sheet,
  eccentricIds,
}: {
  sheet: EccentricViewSheet;
  eccentricIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <EccentricMissing />;
  }

  if (sheet.kind !== "physical") {
    return <EccentricRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-eccentric-sheet="physical"
      data-eccentric-state={sheet.isEccentric ? "eccentric" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ECCENTRIC_MIRROR_SCRIPT }} />
      <SyncEccentric listingIds={eccentricIds} />

      <MallHero>
        <MallCrumb label="I will not eccentric it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Eccentric</span>
        </MallCrumb>

        <MallEyebrow>I will not eccentric it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isEccentric ? ECCENTRIC_NOTICE_TITLE : ECCENTRIC_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ECCENTRIC_TABLE_LINE} {ECCENTRIC_SKIP_LINE} {ECCENTRIC_UNNAMED_LINE}{" "}
            {ECCENTRIC_WALK_LINE} {ECCENTRIC_STAYS_LINE} {ECCENTRIC_STILL_LINE}{" "}
            {ECCENTRIC_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-eccentric-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isEccentric ? (
              <Badge variant="outline">I will not eccentric it</Badge>
            ) : (
              <Badge variant="ghost">Eccentric not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Eccentric paper
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
            {sheet.isEccentric
              ? "Still for sale. Seller taped the eccentric note. Status stays available. Not a shop mistrack."
              : "Still a skip. Still unnamed. Tape it when walkers still want a shop recenter."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isEccentric ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not eccentric it"
              title={ECCENTRIC_NOTICE_TITLE}
              body={`${ECCENTRIC_STILL_LINE} avail=open still lists this LP.`}
            />
          ) : (
            <ListingEccentricEmpty listingId={sheet.listingId} />
          )}

          <EccentricForm listingId={sheet.listingId} isEccentric={sheet.isEccentric} />

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
