import Link from "next/link";

import { ListingAvarEmpty } from "@/components/listing-avar-empty";
import { SyncAvar } from "@/components/listing-avar-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  AVAR_BOLD_LINE,
  AVAR_LEAVE_LINE,
  AVAR_MIRROR_SCRIPT,
  AVAR_NOTICE_TITLE,
  AVAR_REFUSE_COPY,
  AVAR_STAYS_LINE,
  AVAR_STILL_LINE,
  AVAR_TABLE_LINE,
  AVAR_TOTE_LINE,
  AVAR_WALK_LINE,
  AVAR_WEIGHTS_LINE,
} from "@/lib/listing-avar";
import { listingAvarWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type AvarViewKind =
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

export type AvarViewSheet = {
  kind: AvarViewKind;
  listingId: string;
  isAvar: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function AvarMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={AVAR_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function AvarRefused({ sheet }: { sheet: AvarViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const pdf = sheet.kind === "pdf";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-avar-sheet={sheet.kind}>
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
        title={AVAR_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "An avar note is for the booth font, not a pack and not a gift code."
              )}
            </p>
            <p>
              {AVAR_TABLE_LINE} {AVAR_WEIGHTS_LINE} {AVAR_BOLD_LINE}{" "}
              {AVAR_STILL_LINE}
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

function AvarForm({
  listingId,
  isAvar,
}: {
  listingId: string;
  isAvar: boolean;
}) {
  return (
    <form
      method="post"
      action={listingAvarWritePath()}
      className="space-y-3"
      data-avar-form={isAvar ? "open" : "avar"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isAvar ? "open" : "avar"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/avar`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isAvar ? AVAR_LEAVE_LINE : AVAR_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isAvar
          ? "Clear the tape. Status and the tote stay put."
          : `${AVAR_STAYS_LINE} ${AVAR_WEIGHTS_LINE} ${AVAR_BOLD_LINE} ${AVAR_STILL_LINE} ${AVAR_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingAvarView({
  sheet,
  avarIds,
}: {
  sheet: AvarViewSheet;
  avarIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <AvarMissing />;
  }

  if (sheet.kind !== "digital") {
    return <AvarRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-avar-sheet="digital"
      data-avar-state={sheet.isAvar ? "avar" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: AVAR_MIRROR_SCRIPT }} />
      <SyncAvar listingIds={avarIds} />

      <MallHero>
        <MallCrumb label="I will not avar it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Avar</span>
        </MallCrumb>

        <MallEyebrow>I will not avar it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isAvar ? AVAR_NOTICE_TITLE : AVAR_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {AVAR_TABLE_LINE} {AVAR_WEIGHTS_LINE} {AVAR_BOLD_LINE}{" "}
            {AVAR_WALK_LINE} {AVAR_STAYS_LINE} {AVAR_STILL_LINE}{" "}
            {AVAR_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-avar-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isAvar ? (
              <Badge variant="outline">I will not avar it</Badge>
            ) : (
              <Badge variant="ghost">Avar not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Avar paper
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
            {sheet.isAvar
              ? "Still for sale. Seller taped the avar note. Status stays available. Not a type shop."
              : "Still two weights. Still almost-bold. Tape it when walkers still want a shop axis-variation map."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isAvar ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not avar it"
              title={AVAR_NOTICE_TITLE}
              body={`${AVAR_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingAvarEmpty listingId={sheet.listingId} />
          )}

          <AvarForm listingId={sheet.listingId} isAvar={sheet.isAvar} />

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
