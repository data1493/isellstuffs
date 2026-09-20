import Link from "next/link";

import { ListingBisqueEmpty } from "@/components/listing-bisque-empty";
import { SyncBisque } from "@/components/listing-bisque-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BISQUE_CHIP_LINE,
  BISQUE_LEAVE_LINE,
  BISQUE_MIRROR_SCRIPT,
  BISQUE_MUG_LINE,
  BISQUE_NOTICE_TITLE,
  BISQUE_REFUSE_COPY,
  BISQUE_STAYS_LINE,
  BISQUE_STILL_LINE,
  BISQUE_TABLE_LINE,
  BISQUE_TOTE_LINE,
  BISQUE_WALK_LINE,
} from "@/lib/listing-bisque";
import { listingBisqueWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BisqueViewKind =
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

export type BisqueViewSheet = {
  kind: BisqueViewKind;
  listingId: string;
  isBisque: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BisqueMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BISQUE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BisqueRefused({ sheet }: { sheet: BisqueViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lid = sheet.kind === "lid";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-bisque-sheet={sheet.kind}>
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
        title={BISQUE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A bisque note is for the diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BISQUE_TABLE_LINE} {BISQUE_MUG_LINE} {BISQUE_CHIP_LINE}{" "}
              {BISQUE_STILL_LINE}
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

function BisqueForm({
  listingId,
  isBisque,
}: {
  listingId: string;
  isBisque: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBisqueWritePath()}
      className="space-y-3"
      data-bisque-form={isBisque ? "open" : "bisque"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBisque ? "open" : "bisque"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/bisque`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBisque ? BISQUE_LEAVE_LINE : BISQUE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBisque
          ? "Clear the tape. Status and the tote stay put."
          : `${BISQUE_STAYS_LINE} ${BISQUE_MUG_LINE} ${BISQUE_CHIP_LINE} ${BISQUE_STILL_LINE} ${BISQUE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBisqueView({
  sheet,
  bisqueIds,
}: {
  sheet: BisqueViewSheet;
  bisqueIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BisqueMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BisqueRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-bisque-sheet="physical"
      data-bisque-state={sheet.isBisque ? "bisque" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BISQUE_MIRROR_SCRIPT }} />
      <SyncBisque listingIds={bisqueIds} />

      <MallHero>
        <MallCrumb label="I will not bisque it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Bisque</span>
        </MallCrumb>

        <MallEyebrow>I will not bisque it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBisque ? BISQUE_NOTICE_TITLE : BISQUE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BISQUE_TABLE_LINE} {BISQUE_MUG_LINE} {BISQUE_CHIP_LINE}{" "}
            {BISQUE_WALK_LINE} {BISQUE_STAYS_LINE} {BISQUE_STILL_LINE}{" "}
            {BISQUE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-bisque-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBisque ? (
              <Badge variant="outline">I will not bisque it</Badge>
            ) : (
              <Badge variant="ghost">Bisque not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Bisque paper
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
            {sheet.isBisque
              ? "Still for sale. Seller taped the bisque note. Status stays available. Not a kiln."
              : "Still a mug. Still a chip. Tape it when walkers still want the clay fired."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBisque ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not bisque it"
              title={BISQUE_NOTICE_TITLE}
              body={`${BISQUE_STILL_LINE} avail=open still lists this mug.`}
            />
          ) : (
            <ListingBisqueEmpty listingId={sheet.listingId} />
          )}

          <BisqueForm listingId={sheet.listingId} isBisque={sheet.isBisque} />

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
