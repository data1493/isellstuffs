import Link from "next/link";

import { ListingGaspEmpty } from "@/components/listing-gasp-empty";
import { SyncGasp } from "@/components/listing-gasp-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GASP_BOLD_LINE,
  GASP_LEAVE_LINE,
  GASP_MIRROR_SCRIPT,
  GASP_NOTICE_TITLE,
  GASP_REFUSE_COPY,
  GASP_STAYS_LINE,
  GASP_STILL_LINE,
  GASP_TABLE_LINE,
  GASP_TOTE_LINE,
  GASP_WALK_LINE,
  GASP_WEIGHTS_LINE,
} from "@/lib/listing-gasp";
import { listingGaspWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GaspViewKind =
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

export type GaspViewSheet = {
  kind: GaspViewKind;
  listingId: string;
  isGasp: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GaspMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GASP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GaspRefused({ sheet }: { sheet: GaspViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const pdf = sheet.kind === "pdf";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-gasp-sheet={sheet.kind}>
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
        title={GASP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A gasp note is for the booth font, not a pack and not a gift code."
              )}
            </p>
            <p>
              {GASP_TABLE_LINE} {GASP_WEIGHTS_LINE} {GASP_BOLD_LINE}{" "}
              {GASP_STILL_LINE}
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

function GaspForm({
  listingId,
  isGasp,
}: {
  listingId: string;
  isGasp: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGaspWritePath()}
      className="space-y-3"
      data-gasp-form={isGasp ? "open" : "gasp"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isGasp ? "open" : "gasp"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/gasp`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGasp ? GASP_LEAVE_LINE : GASP_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGasp
          ? "Clear the tape. Status and the tote stay put."
          : `${GASP_STAYS_LINE} ${GASP_WEIGHTS_LINE} ${GASP_BOLD_LINE} ${GASP_STILL_LINE} ${GASP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGaspView({
  sheet,
  gaspIds,
}: {
  sheet: GaspViewSheet;
  gaspIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GaspMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GaspRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-gasp-sheet="digital"
      data-gasp-state={sheet.isGasp ? "gasp" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GASP_MIRROR_SCRIPT }} />
      <SyncGasp listingIds={gaspIds} />

      <MallHero>
        <MallCrumb label="I will not gasp it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Gasp</span>
        </MallCrumb>

        <MallEyebrow>I will not gasp it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGasp ? GASP_NOTICE_TITLE : GASP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GASP_TABLE_LINE} {GASP_WEIGHTS_LINE} {GASP_BOLD_LINE}{" "}
            {GASP_WALK_LINE} {GASP_STAYS_LINE} {GASP_STILL_LINE}{" "}
            {GASP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-gasp-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGasp ? (
              <Badge variant="outline">I will not gasp it</Badge>
            ) : (
              <Badge variant="ghost">Gasp not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Gasp paper
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
            {sheet.isGasp
              ? "Still for sale. Seller taped the gasp note. Status stays available. Not a type shop. Not an account."
              : "Still two weights. Still almost-bold. Tape it when walkers still want shop GASP greys."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGasp ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not gasp it"
              title={GASP_NOTICE_TITLE}
              body={`${GASP_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingGaspEmpty listingId={sheet.listingId} />
          )}

          <GaspForm listingId={sheet.listingId} isGasp={sheet.isGasp} />

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
