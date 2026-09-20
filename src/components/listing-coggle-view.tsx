import Link from "next/link";

import { ListingCoggleEmpty } from "@/components/listing-coggle-empty";
import { SyncCoggle } from "@/components/listing-coggle-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  COGGLE_COFFEE_LINE,
  COGGLE_LEAVE_LINE,
  COGGLE_MIRROR_SCRIPT,
  COGGLE_NOTICE_TITLE,
  COGGLE_REFUSE_COPY,
  COGGLE_RIM_LINE,
  COGGLE_STAYS_LINE,
  COGGLE_STILL_LINE,
  COGGLE_TABLE_LINE,
  COGGLE_TOTE_LINE,
  COGGLE_WALK_LINE,
} from "@/lib/listing-coggle";
import { listingCoggleWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type CoggleViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

export type CoggleViewSheet = {
  kind: CoggleViewKind;
  listingId: string;
  isCoggle: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function CoggleMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={COGGLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function CoggleRefused({ sheet }: { sheet: CoggleViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lid = sheet.kind === "lid";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-coggle-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lid
                ? "A lid is not a mug"
                : whisk
                  ? "A whisk is not a mug"
                  : chair
                    ? "A chair is not a mug"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={COGGLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A coggle note is for the diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {COGGLE_TABLE_LINE} {COGGLE_RIM_LINE} {COGGLE_COFFEE_LINE}{" "}
              {COGGLE_STILL_LINE}
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

function CoggleForm({
  listingId,
  isCoggle,
}: {
  listingId: string;
  isCoggle: boolean;
}) {
  return (
    <form
      method="post"
      action={listingCoggleWritePath()}
      className="space-y-3"
      data-coggle-form={isCoggle ? "open" : "coggle"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isCoggle ? "open" : "coggle"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/coggle`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isCoggle ? COGGLE_LEAVE_LINE : COGGLE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isCoggle
          ? "Clear the tape. Status and the tote stay put."
          : `${COGGLE_STAYS_LINE} ${COGGLE_RIM_LINE} ${COGGLE_COFFEE_LINE} ${COGGLE_STILL_LINE} ${COGGLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingCoggleView({
  sheet,
  coggleIds,
}: {
  sheet: CoggleViewSheet;
  coggleIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <CoggleMissing />;
  }

  if (sheet.kind !== "physical") {
    return <CoggleRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-coggle-sheet="physical"
      data-coggle-state={sheet.isCoggle ? "coggle" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: COGGLE_MIRROR_SCRIPT }} />
      <SyncCoggle listingIds={coggleIds} />

      <MallHero>
        <MallCrumb label="I will not coggle it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Coggle</span>
        </MallCrumb>

        <MallEyebrow>I will not coggle it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isCoggle ? COGGLE_NOTICE_TITLE : COGGLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {COGGLE_TABLE_LINE} {COGGLE_RIM_LINE} {COGGLE_COFFEE_LINE}{" "}
            {COGGLE_WALK_LINE} {COGGLE_STAYS_LINE} {COGGLE_STILL_LINE}{" "}
            {COGGLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-coggle-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isCoggle ? (
              <Badge variant="outline">I will not coggle it</Badge>
            ) : (
              <Badge variant="ghost">Coggle not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Coggle paper
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
            {sheet.isCoggle
              ? "Still for sale. Seller taped the coggle note. Status stays available. Not a shop cog."
              : "Still a diner rim. Still holds coffee. Tape it when walkers still want a shop cogged rim."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isCoggle ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not coggle it"
              title={COGGLE_NOTICE_TITLE}
              body={`${COGGLE_STILL_LINE} avail=open still lists this mug.`}
            />
          ) : (
            <ListingCoggleEmpty listingId={sheet.listingId} />
          )}

          <CoggleForm listingId={sheet.listingId} isCoggle={sheet.isCoggle} />

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
