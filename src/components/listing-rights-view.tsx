import Link from "next/link";

import { ListingRightsEmpty } from "@/components/listing-rights-empty";
import { SyncRights } from "@/components/listing-rights-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  RIGHTS_MIRROR_SCRIPT,
  RIGHTS_NOTICE_TITLE,
  RIGHTS_REFUSE_COPY,
  RIGHTS_STAYS_LINE,
  RIGHTS_STILL_LINE,
  RIGHTS_TABLE_LINE,
  RIGHTS_TOTE_LINE,
  RIGHTS_WALK_LINE,
} from "@/lib/listing-rights";
import { listingPath, listingRightsWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type RightsViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type RightsViewSheet = {
  kind: RightsViewKind;
  listingId: string;
  isRights: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function RightsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={RIGHTS_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button
          className="h-11 w-full rounded-full px-5 sm:w-auto"
          render={<Link href="/explore" />}
        >
          Walk the concourse
        </Button>
      }
    />
  );
}

function RightsRefused({ sheet }: { sheet: RightsViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-rights-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={RIGHTS_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not clear it is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {RIGHTS_NOTICE_TITLE} {RIGHTS_WALK_LINE} {RIGHTS_STILL_LINE}
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

function RightsForm({
  listingId,
  isRights,
}: {
  listingId: string;
  isRights: boolean;
}) {
  return (
    <form
      method="post"
      action={listingRightsWritePath()}
      className="space-y-3"
      data-rights-form={isRights ? "open" : "rights"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isRights ? "open" : "rights"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/rights`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isRights ? "Leave it as recorded" : "I will not clear it"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isRights
          ? "Clear the rights paper. Status and the tote stay put."
          : `${RIGHTS_STAYS_LINE} ${RIGHTS_WALK_LINE} ${RIGHTS_STILL_LINE} ${RIGHTS_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingRightsView({
  sheet,
  rightsIds,
}: {
  sheet: RightsViewSheet;
  rightsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <RightsMissing />;
  }

  if (sheet.kind !== "digital") {
    return <RightsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-rights-sheet="digital"
      data-rights-state={sheet.isRights ? "rights" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: RIGHTS_MIRROR_SCRIPT }} />
      <SyncRights listingIds={rightsIds} />

      <MallHero>
        <MallCrumb label="I will not clear it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Rights</span>
        </MallCrumb>

        <MallEyebrow>I will not clear it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isRights ? RIGHTS_NOTICE_TITLE : RIGHTS_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {RIGHTS_NOTICE_TITLE} {RIGHTS_WALK_LINE} {RIGHTS_STILL_LINE}{" "}
            {RIGHTS_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-rights-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isRights ? (
              <Badge variant="outline">I will not clear it</Badge>
            ) : (
              <Badge variant="ghost">Still as recorded</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Rights paper
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
            {sheet.isRights
              ? "Still for sale. Seller taped that they will not clear it. Walkers still ask Beats for a license. Status stays available."
              : "As recorded. Tape it when walkers still want a license on the kicks."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isRights ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not clear it"
              title={RIGHTS_NOTICE_TITLE}
              body={`${RIGHTS_STILL_LINE} avail=open still lists this file. ${RIGHTS_STAYS_LINE}`}
            />
          ) : (
            <ListingRightsEmpty listingId={sheet.listingId} />
          )}

          <RightsForm listingId={sheet.listingId} isRights={sheet.isRights} />

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
