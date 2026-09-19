import Link from "next/link";

import { ListingPancakeEmpty } from "@/components/listing-pancake-empty";
import { SyncPancake } from "@/components/listing-pancake-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  PANCAKE_HISS_LINE,
  PANCAKE_LEAVE_LINE,
  PANCAKE_MIRROR_SCRIPT,
  PANCAKE_NOTICE_TITLE,
  PANCAKE_REFUSE_COPY,
  PANCAKE_STAYS_LINE,
  PANCAKE_STILL_LINE,
  PANCAKE_SUMMER_LINE,
  PANCAKE_TABLE_LINE,
  PANCAKE_TOTE_LINE,
  PANCAKE_WALK_LINE,
} from "@/lib/listing-pancake";
import { listingPancakeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type PancakeViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

export type PancakeViewSheet = {
  kind: PancakeViewKind;
  listingId: string;
  isPancake: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function PancakeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={PANCAKE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function PancakeRefused({ sheet }: { sheet: PancakeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-pancake-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : lp
                ? "A record is not a cassette"
                : jewels
                  ? "Jewel cases do not flop"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={PANCAKE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A pancake note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {PANCAKE_TABLE_LINE} {PANCAKE_HISS_LINE} {PANCAKE_SUMMER_LINE}{" "}
              {PANCAKE_STILL_LINE}
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

function PancakeForm({
  listingId,
  isPancake,
}: {
  listingId: string;
  isPancake: boolean;
}) {
  return (
    <form
      method="post"
      action={listingPancakeWritePath()}
      className="space-y-3"
      data-pancake-form={isPancake ? "open" : "pancake"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isPancake ? "open" : "pancake"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/pancake`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isPancake ? PANCAKE_LEAVE_LINE : PANCAKE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isPancake
          ? "Clear the tape. Status and the tote stay put."
          : `${PANCAKE_STAYS_LINE} ${PANCAKE_HISS_LINE} ${PANCAKE_SUMMER_LINE} ${PANCAKE_STILL_LINE} ${PANCAKE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingPancakeView({
  sheet,
  pancakeIds,
}: {
  sheet: PancakeViewSheet;
  pancakeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <PancakeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <PancakeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-pancake-sheet="physical"
      data-pancake-state={sheet.isPancake ? "pancake" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: PANCAKE_MIRROR_SCRIPT }} />
      <SyncPancake listingIds={pancakeIds} />

      <MallHero>
        <MallCrumb label="I will not pancake it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Pancake</span>
        </MallCrumb>

        <MallEyebrow>I will not pancake it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isPancake ? PANCAKE_NOTICE_TITLE : PANCAKE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {PANCAKE_TABLE_LINE} {PANCAKE_HISS_LINE} {PANCAKE_SUMMER_LINE}{" "}
            {PANCAKE_WALK_LINE} {PANCAKE_STAYS_LINE} {PANCAKE_STILL_LINE}{" "}
            {PANCAKE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-pancake-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isPancake ? (
              <Badge variant="outline">I will not pancake it</Badge>
            ) : (
              <Badge variant="ghost">Pancake not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pancake paper
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
            {sheet.isPancake
              ? "Still for sale. Seller taped the pancake note. Status stays available. Not a shop."
              : "Still hiss. Still SUMMER 93. Tape it when walkers still want the hubs packed."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isPancake ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not pancake it"
              title={PANCAKE_NOTICE_TITLE}
              body={`${PANCAKE_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingPancakeEmpty listingId={sheet.listingId} />
          )}

          <PancakeForm listingId={sheet.listingId} isPancake={sheet.isPancake} />

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
