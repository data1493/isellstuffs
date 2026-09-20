import Link from "next/link";

import { ListingBrazeEmpty } from "@/components/listing-braze-empty";
import { SyncBraze } from "@/components/listing-braze-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BRAZE_BENT_LINE,
  BRAZE_LEAVE_LINE,
  BRAZE_METAL_LINE,
  BRAZE_MIRROR_SCRIPT,
  BRAZE_NOTICE_TITLE,
  BRAZE_REFUSE_COPY,
  BRAZE_STAYS_LINE,
  BRAZE_STILL_LINE,
  BRAZE_TABLE_LINE,
  BRAZE_TOTE_LINE,
  BRAZE_WALK_LINE,
} from "@/lib/listing-braze";
import { listingBrazeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BrazeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "lid"
  | "owned";

export type BrazeViewSheet = {
  kind: BrazeViewKind;
  listingId: string;
  isBraze: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BrazeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BRAZE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BrazeRefused({ sheet }: { sheet: BrazeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const lid = sheet.kind === "lid";
  const owned = sheet.kind === "owned";

  return (
    <div data-braze-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a braze"
                : lid
                  ? "A lid is not a braze"
                  : owned
                    ? "Another note already owns that one"
                    : "Walked"
        }
        title={BRAZE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A braze note is for the balloon whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BRAZE_TABLE_LINE} {BRAZE_BENT_LINE} {BRAZE_METAL_LINE}{" "}
              {BRAZE_STILL_LINE}
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

function BrazeForm({
  listingId,
  isBraze,
}: {
  listingId: string;
  isBraze: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBrazeWritePath()}
      className="space-y-3"
      data-braze-form={isBraze ? "open" : "braze"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBraze ? "open" : "braze"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/braze`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBraze ? BRAZE_LEAVE_LINE : BRAZE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBraze
          ? "Clear the tape. Status and the tote stay put."
          : `${BRAZE_STAYS_LINE} ${BRAZE_BENT_LINE} ${BRAZE_METAL_LINE} ${BRAZE_STILL_LINE} ${BRAZE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBrazeView({
  sheet,
  brazeIds,
}: {
  sheet: BrazeViewSheet;
  brazeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BrazeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BrazeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-braze-sheet="physical"
      data-braze-state={sheet.isBraze ? "braze" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BRAZE_MIRROR_SCRIPT }} />
      <SyncBraze listingIds={brazeIds} />

      <MallHero>
        <MallCrumb label="I will not braze it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Braze</span>
        </MallCrumb>

        <MallEyebrow>I will not braze it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBraze ? BRAZE_NOTICE_TITLE : BRAZE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BRAZE_TABLE_LINE} {BRAZE_BENT_LINE} {BRAZE_METAL_LINE}{" "}
            {BRAZE_WALK_LINE} {BRAZE_STAYS_LINE} {BRAZE_STILL_LINE}{" "}
            {BRAZE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-braze-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBraze ? (
              <Badge variant="outline">I will not braze it</Badge>
            ) : (
              <Badge variant="ghost">Braze not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Braze paper
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
            {sheet.isBraze
              ? "Still for sale. Seller taped the braze note. Status stays available. Not a shop."
              : "Still bent. Still metal. Tape it when walkers still want a shop brass join."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBraze ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not braze it"
              title={BRAZE_NOTICE_TITLE}
              body={`${BRAZE_STILL_LINE} avail=open still lists this whisk.`}
            />
          ) : (
            <ListingBrazeEmpty listingId={sheet.listingId} />
          )}

          <BrazeForm listingId={sheet.listingId} isBraze={sheet.isBraze} />

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
