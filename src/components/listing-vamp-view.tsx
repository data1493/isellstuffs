import Link from "next/link";

import { ListingVampEmpty } from "@/components/listing-vamp-empty";
import { SyncVamp } from "@/components/listing-vamp-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  VAMP_FLEX_LINE,
  VAMP_LACES_LINE,
  VAMP_LEAVE_LINE,
  VAMP_MIRROR_SCRIPT,
  VAMP_NOTICE_TITLE,
  VAMP_REFUSE_COPY,
  VAMP_STAYS_LINE,
  VAMP_STILL_LINE,
  VAMP_TABLE_LINE,
  VAMP_TOTE_LINE,
  VAMP_WALK_LINE,
} from "@/lib/listing-vamp";
import { listingPath, listingVampWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type VampViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "jacket"
  | "lid"
  | "chair"
  | "owned";

export type VampViewSheet = {
  kind: VampViewKind;
  listingId: string;
  isVamp: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function VampMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={VAMP_REFUSE_COPY}
      body="No SKU with that id. Nothing to tape a vamp note on."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function VampRefused({ sheet }: { sheet: VampViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const jacket = sheet.kind === "jacket";
  const lid = sheet.kind === "lid";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-vamp-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : jacket
                ? "A jacket is not a pair"
                : lid
                  ? "A lid is not a pair"
                  : chair
                    ? "A chair is not a pair"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={VAMP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A vamp note is for the split-sole pair on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {VAMP_TABLE_LINE} {VAMP_FLEX_LINE} {VAMP_LACES_LINE} {VAMP_STILL_LINE}
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

function VampForm({
  listingId,
  isVamp,
}: {
  listingId: string;
  isVamp: boolean;
}) {
  return (
    <form
      method="post"
      action={listingVampWritePath()}
      className="space-y-3"
      data-vamp-form={isVamp ? "open" : "vamp"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isVamp ? "open" : "vamp"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/vamp`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isVamp ? VAMP_LEAVE_LINE : VAMP_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isVamp
          ? "Clear the tape. Status and the tote stay put."
          : `${VAMP_STAYS_LINE} ${VAMP_FLEX_LINE} ${VAMP_LACES_LINE} ${VAMP_STILL_LINE} ${VAMP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingVampView({
  sheet,
  vampIds,
}: {
  sheet: VampViewSheet;
  vampIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <VampMissing />;
  }

  if (sheet.kind !== "physical") {
    return <VampRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-vamp-sheet="physical"
      data-vamp-state={sheet.isVamp ? "vamp" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: VAMP_MIRROR_SCRIPT }} />
      <SyncVamp listingIds={vampIds} />

      <MallHero>
        <MallCrumb label="I will not vamp them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Vamp</span>
        </MallCrumb>

        <MallEyebrow>I will not vamp them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isVamp ? VAMP_NOTICE_TITLE : VAMP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {VAMP_TABLE_LINE} {VAMP_FLEX_LINE} {VAMP_LACES_LINE} {VAMP_WALK_LINE}{" "}
            {VAMP_STAYS_LINE} {VAMP_STILL_LINE} {VAMP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-vamp-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isVamp ? (
              <Badge variant="outline">I will not vamp them</Badge>
            ) : (
              <Badge variant="ghost">Vamp not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Vamp paper
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
            {sheet.isVamp
              ? "Still for sale. Seller taped the vamp note. Status stays available. Not a cobbler."
              : "Still a flex. Still original laces. Tape it when walkers still want a shop vamp."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isVamp ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not vamp them"
              title={VAMP_NOTICE_TITLE}
              body={`${VAMP_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingVampEmpty listingId={sheet.listingId} />
          )}

          <VampForm listingId={sheet.listingId} isVamp={sheet.isVamp} />

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
