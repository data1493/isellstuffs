import Link from "next/link";

import { ListingEraseEmpty } from "@/components/listing-erase-empty";
import { SyncErase } from "@/components/listing-erase-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ERASE_HISS_LINE,
  ERASE_LEAVE_LINE,
  ERASE_MIRROR_SCRIPT,
  ERASE_NOTICE_TITLE,
  ERASE_RADIO_LINE,
  ERASE_REFUSE_COPY,
  ERASE_STAYS_LINE,
  ERASE_STILL_LINE,
  ERASE_TABLE_LINE,
  ERASE_TOTE_LINE,
  ERASE_WALK_LINE,
} from "@/lib/listing-erase";
import { listingEraseWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type EraseViewKind =
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

export type EraseViewSheet = {
  kind: EraseViewKind;
  listingId: string;
  isErase: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function EraseMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ERASE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function EraseRefused({ sheet }: { sheet: EraseViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lp = sheet.kind === "lp";
  const jewels = sheet.kind === "jewels";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-erase-sheet={sheet.kind}>
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
                  ? "Jewel cases do not erase"
                  : chair
                    ? "A chair is not a cassette"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={ERASE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An erase note is for SUMMER 93 on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {ERASE_TABLE_LINE} {ERASE_RADIO_LINE} {ERASE_HISS_LINE}{" "}
              {ERASE_STILL_LINE}
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

function EraseForm({
  listingId,
  isErase,
}: {
  listingId: string;
  isErase: boolean;
}) {
  return (
    <form
      method="post"
      action={listingEraseWritePath()}
      className="space-y-3"
      data-erase-form={isErase ? "open" : "erase"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isErase ? "open" : "erase"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/erase`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isErase ? ERASE_LEAVE_LINE : ERASE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isErase
          ? "Clear the tape. Status and the tote stay put."
          : `${ERASE_STAYS_LINE} ${ERASE_RADIO_LINE} ${ERASE_HISS_LINE} ${ERASE_STILL_LINE} ${ERASE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingEraseView({
  sheet,
  eraseIds,
}: {
  sheet: EraseViewSheet;
  eraseIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <EraseMissing />;
  }

  if (sheet.kind !== "physical") {
    return <EraseRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-erase-sheet="physical"
      data-erase-state={sheet.isErase ? "erase" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ERASE_MIRROR_SCRIPT }} />
      <SyncErase listingIds={eraseIds} />

      <MallHero>
        <MallCrumb label="I will not erase it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Erase</span>
        </MallCrumb>

        <MallEyebrow>I will not erase it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isErase ? ERASE_NOTICE_TITLE : ERASE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ERASE_TABLE_LINE} {ERASE_RADIO_LINE} {ERASE_HISS_LINE}{" "}
            {ERASE_WALK_LINE} {ERASE_STAYS_LINE} {ERASE_STILL_LINE}{" "}
            {ERASE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-erase-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isErase ? (
              <Badge variant="outline">I will not erase it</Badge>
            ) : (
              <Badge variant="ghost">Erase not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Erase paper
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
            {sheet.isErase
              ? "Still for sale. Seller taped the erase note. Status stays available. Not a shop."
              : "Still a radio edit. Still hiss. Tape it when walkers still want Side A blank."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isErase ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not erase it"
              title={ERASE_NOTICE_TITLE}
              body={`${ERASE_STILL_LINE} avail=open still lists this tape.`}
            />
          ) : (
            <ListingEraseEmpty listingId={sheet.listingId} />
          )}

          <EraseForm listingId={sheet.listingId} isErase={sheet.isErase} />

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
