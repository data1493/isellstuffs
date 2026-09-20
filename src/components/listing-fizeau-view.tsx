import Link from "next/link";

import { ListingFizeauEmpty } from "@/components/listing-fizeau-empty";
import { SyncFizeau } from "@/components/listing-fizeau-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FIZEAU_LEAVE_LINE,
  FIZEAU_LID_LINE,
  FIZEAU_MIRROR_SCRIPT,
  FIZEAU_NOTICE_TITLE,
  FIZEAU_POT_LINE,
  FIZEAU_REFUSE_COPY,
  FIZEAU_STAYS_LINE,
  FIZEAU_STILL_LINE,
  FIZEAU_TABLE_LINE,
  FIZEAU_TOTE_LINE,
  FIZEAU_WALK_LINE,
} from "@/lib/listing-fizeau";
import { listingFizeauWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FizeauViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

export type FizeauViewSheet = {
  kind: FizeauViewKind;
  listingId: string;
  isFizeau: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FizeauMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FIZEAU_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FizeauRefused({ sheet }: { sheet: FizeauViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const mug = sheet.kind === "mug";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-fizeau-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : mug
                ? "A mug is not a lid"
                : whisk
                  ? "A whisk is not a lid"
                  : chair
                    ? "A chair is not a lid"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={FIZEAU_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A fizeau note is for the pot lid on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {FIZEAU_TABLE_LINE} {FIZEAU_LID_LINE} {FIZEAU_POT_LINE}{" "}
              {FIZEAU_STILL_LINE}
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

function FizeauForm({
  listingId,
  isFizeau,
}: {
  listingId: string;
  isFizeau: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFizeauWritePath()}
      className="space-y-3"
      data-fizeau-form={isFizeau ? "open" : "fizeau"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isFizeau ? "open" : "fizeau"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/fizeau`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFizeau ? FIZEAU_LEAVE_LINE : FIZEAU_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFizeau
          ? "Clear the tape. Status and the tote stay put."
          : `${FIZEAU_STAYS_LINE} ${FIZEAU_LID_LINE} ${FIZEAU_POT_LINE} ${FIZEAU_STILL_LINE} ${FIZEAU_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFizeauView({
  sheet,
  fizeauIds,
}: {
  sheet: FizeauViewSheet;
  fizeauIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FizeauMissing />;
  }

  if (sheet.kind !== "physical") {
    return <FizeauRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-fizeau-sheet="physical"
      data-fizeau-state={sheet.isFizeau ? "fizeau" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FIZEAU_MIRROR_SCRIPT }} />
      <SyncFizeau listingIds={fizeauIds} />

      <MallHero>
        <MallCrumb label="I will not fizeau it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Fizeau</span>
        </MallCrumb>

        <MallEyebrow>I will not fizeau it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFizeau ? FIZEAU_NOTICE_TITLE : FIZEAU_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FIZEAU_TABLE_LINE} {FIZEAU_LID_LINE} {FIZEAU_POT_LINE}{" "}
            {FIZEAU_WALK_LINE} {FIZEAU_STAYS_LINE} {FIZEAU_STILL_LINE}{" "}
            {FIZEAU_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-fizeau-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isFizeau ? (
              <Badge variant="outline">I will not fizeau it</Badge>
            ) : (
              <Badge variant="ghost">Fizeau not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Fizeau paper
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
            {sheet.isFizeau
              ? "Still for sale. Seller taped the fizeau note. Status stays available. Not a shop."
              : "Still a lid. Still no pot. Tape it when walkers still want shop Fizeau bands."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFizeau ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not fizeau it"
              title={FIZEAU_NOTICE_TITLE}
              body={`${FIZEAU_STILL_LINE} avail=open still lists this lid.`}
            />
          ) : (
            <ListingFizeauEmpty listingId={sheet.listingId} />
          )}

          <FizeauForm listingId={sheet.listingId} isFizeau={sheet.isFizeau} />

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
