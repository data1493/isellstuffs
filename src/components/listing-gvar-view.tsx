import Link from "next/link";

import { ListingGvarEmpty } from "@/components/listing-gvar-empty";
import { SyncGvar } from "@/components/listing-gvar-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GVAR_BOLD_LINE,
  GVAR_LEAVE_LINE,
  GVAR_MIRROR_SCRIPT,
  GVAR_NOTICE_TITLE,
  GVAR_REFUSE_COPY,
  GVAR_STAYS_LINE,
  GVAR_STILL_LINE,
  GVAR_TABLE_LINE,
  GVAR_TOTE_LINE,
  GVAR_WALK_LINE,
  GVAR_WEIGHTS_LINE,
} from "@/lib/listing-gvar";
import { listingGvarWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GvarViewKind =
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

export type GvarViewSheet = {
  kind: GvarViewKind;
  listingId: string;
  isGvar: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GvarMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GVAR_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GvarRefused({ sheet }: { sheet: GvarViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const pdf = sheet.kind === "pdf";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-gvar-sheet={sheet.kind}>
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
        title={GVAR_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A gvar note is for the booth font, not a pack and not a gift code."
              )}
            </p>
            <p>
              {GVAR_TABLE_LINE} {GVAR_WEIGHTS_LINE} {GVAR_BOLD_LINE}{" "}
              {GVAR_STILL_LINE}
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

function GvarForm({
  listingId,
  isGvar,
}: {
  listingId: string;
  isGvar: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGvarWritePath()}
      className="space-y-3"
      data-gvar-form={isGvar ? "open" : "gvar"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isGvar ? "open" : "gvar"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/gvar`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGvar ? GVAR_LEAVE_LINE : GVAR_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGvar
          ? "Clear the tape. Status and the tote stay put."
          : `${GVAR_STAYS_LINE} ${GVAR_WEIGHTS_LINE} ${GVAR_BOLD_LINE} ${GVAR_STILL_LINE} ${GVAR_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGvarView({
  sheet,
  gvarIds,
}: {
  sheet: GvarViewSheet;
  gvarIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GvarMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GvarRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-gvar-sheet="digital"
      data-gvar-state={sheet.isGvar ? "gvar" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GVAR_MIRROR_SCRIPT }} />
      <SyncGvar listingIds={gvarIds} />

      <MallHero>
        <MallCrumb label="I will not gvar it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Gvar</span>
        </MallCrumb>

        <MallEyebrow>I will not gvar it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGvar ? GVAR_NOTICE_TITLE : GVAR_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GVAR_TABLE_LINE} {GVAR_WEIGHTS_LINE} {GVAR_BOLD_LINE}{" "}
            {GVAR_WALK_LINE} {GVAR_STAYS_LINE} {GVAR_STILL_LINE}{" "}
            {GVAR_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-gvar-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGvar ? (
              <Badge variant="outline">I will not gvar it</Badge>
            ) : (
              <Badge variant="ghost">Gvar not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Gvar paper
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
            {sheet.isGvar
              ? "Still for sale. Seller taped the gvar note. Status stays available. Not a type shop."
              : "Still two weights. Still almost-bold. Tape it when walkers still want a shop glyph-variation table."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGvar ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not gvar it"
              title={GVAR_NOTICE_TITLE}
              body={`${GVAR_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingGvarEmpty listingId={sheet.listingId} />
          )}

          <GvarForm listingId={sheet.listingId} isGvar={sheet.isGvar} />

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
