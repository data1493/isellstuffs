import Link from "next/link";

import { ListingOpbdEmpty } from "@/components/listing-opbd-empty";
import { SyncOpbd } from "@/components/listing-opbd-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  OPBD_BOLD_LINE,
  OPBD_LEAVE_LINE,
  OPBD_MIRROR_SCRIPT,
  OPBD_NOTICE_TITLE,
  OPBD_REFUSE_COPY,
  OPBD_STAYS_LINE,
  OPBD_STILL_LINE,
  OPBD_TABLE_LINE,
  OPBD_TOTE_LINE,
  OPBD_WALK_LINE,
  OPBD_WEIGHTS_LINE,
} from "@/lib/listing-opbd";
import { listingOpbdWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type OpbdViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

export type OpbdViewSheet = {
  kind: OpbdViewKind;
  listingId: string;
  isOpbd: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function OpbdMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={OPBD_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function OpbdRefused({ sheet }: { sheet: OpbdViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const pdf = sheet.kind === "pdf";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-opbd-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : pack
              ? "A pack is not a font"
              : pdf
                ? "A junk PDF is not a font"
                : chair
                  ? "A chair is not a font"
                  : owned
                    ? "Another note already owns that one"
                    : object
                      ? "On the table"
                      : "Walked"
        }
        title={OPBD_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An opbd note is for the booth font, not a pack and not a gift code."
              )}
            </p>
            <p>
              {OPBD_TABLE_LINE} {OPBD_WEIGHTS_LINE} {OPBD_BOLD_LINE}{" "}
              {OPBD_STILL_LINE}
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

function OpbdForm({
  listingId,
  isOpbd,
}: {
  listingId: string;
  isOpbd: boolean;
}) {
  return (
    <form
      method="post"
      action={listingOpbdWritePath()}
      className="space-y-3"
      data-opbd-form={isOpbd ? "open" : "opbd"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isOpbd ? "open" : "opbd"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/opbd`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isOpbd ? OPBD_LEAVE_LINE : OPBD_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isOpbd
          ? "Clear the tape. Status and the tote stay put."
          : `${OPBD_STAYS_LINE} ${OPBD_WEIGHTS_LINE} ${OPBD_BOLD_LINE} ${OPBD_STILL_LINE} ${OPBD_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingOpbdView({
  sheet,
  opbdIds,
}: {
  sheet: OpbdViewSheet;
  opbdIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <OpbdMissing />;
  }

  if (sheet.kind !== "digital") {
    return <OpbdRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-opbd-sheet="digital"
      data-opbd-state={sheet.isOpbd ? "opbd" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: OPBD_MIRROR_SCRIPT }} />
      <SyncOpbd listingIds={opbdIds} />

      <MallHero>
        <MallCrumb label="I will not opbd it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Opbd</span>
        </MallCrumb>

        <MallEyebrow>I will not opbd it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isOpbd ? OPBD_NOTICE_TITLE : OPBD_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {OPBD_TABLE_LINE} {OPBD_WEIGHTS_LINE} {OPBD_BOLD_LINE}{" "}
            {OPBD_WALK_LINE} {OPBD_STAYS_LINE} {OPBD_STILL_LINE}{" "}
            {OPBD_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-opbd-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isOpbd ? (
              <Badge variant="outline">I will not opbd it</Badge>
            ) : (
              <Badge variant="ghost">Opbd not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Opbd paper
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
            {sheet.isOpbd
              ? "Still for sale. Seller taped the opbd note. Status stays available. Not a type shop."
              : "Still two weights. Still almost-bold. Tape it when walkers still want a shop optical-bounds table."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isOpbd ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not opbd it"
              title={OPBD_NOTICE_TITLE}
              body={`${OPBD_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingOpbdEmpty listingId={sheet.listingId} />
          )}

          <OpbdForm listingId={sheet.listingId} isOpbd={sheet.isOpbd} />

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
