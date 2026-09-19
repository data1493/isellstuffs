import Link from "next/link";

import { ListingGlazeEmpty } from "@/components/listing-glaze-empty";
import { SyncGlaze } from "@/components/listing-glaze-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GLAZE_CHIP_LINE,
  GLAZE_LEAVE_LINE,
  GLAZE_MIRROR_SCRIPT,
  GLAZE_MUG_LINE,
  GLAZE_NOTICE_TITLE,
  GLAZE_REFUSE_COPY,
  GLAZE_STAYS_LINE,
  GLAZE_STILL_LINE,
  GLAZE_TABLE_LINE,
  GLAZE_TOTE_LINE,
  GLAZE_WALK_LINE,
} from "@/lib/listing-glaze";
import { listingGlazeWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GlazeViewKind =
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

export type GlazeViewSheet = {
  kind: GlazeViewKind;
  listingId: string;
  isGlaze: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GlazeMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GLAZE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GlazeRefused({ sheet }: { sheet: GlazeViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const lid = sheet.kind === "lid";
  const whisk = sheet.kind === "whisk";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-glaze-sheet={sheet.kind}>
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
        title={GLAZE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A glaze note is for the diner mug on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {GLAZE_TABLE_LINE} {GLAZE_CHIP_LINE} {GLAZE_MUG_LINE}{" "}
              {GLAZE_STILL_LINE}
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

function GlazeForm({
  listingId,
  isGlaze,
}: {
  listingId: string;
  isGlaze: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGlazeWritePath()}
      className="space-y-3"
      data-glaze-form={isGlaze ? "open" : "glaze"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGlaze ? "open" : "glaze"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/glaze`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGlaze ? GLAZE_LEAVE_LINE : GLAZE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGlaze
          ? "Clear the tape. Status and the tote stay put."
          : `${GLAZE_STAYS_LINE} ${GLAZE_CHIP_LINE} ${GLAZE_MUG_LINE} ${GLAZE_STILL_LINE} ${GLAZE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGlazeView({
  sheet,
  glazeIds,
}: {
  sheet: GlazeViewSheet;
  glazeIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GlazeMissing />;
  }

  if (sheet.kind !== "physical") {
    return <GlazeRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-glaze-sheet="physical"
      data-glaze-state={sheet.isGlaze ? "glaze" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GLAZE_MIRROR_SCRIPT }} />
      <SyncGlaze listingIds={glazeIds} />

      <MallHero>
        <MallCrumb label="I will not glaze it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Glaze</span>
        </MallCrumb>

        <MallEyebrow>I will not glaze it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGlaze ? GLAZE_NOTICE_TITLE : GLAZE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GLAZE_TABLE_LINE} {GLAZE_CHIP_LINE} {GLAZE_MUG_LINE}{" "}
            {GLAZE_WALK_LINE} {GLAZE_STAYS_LINE} {GLAZE_STILL_LINE}{" "}
            {GLAZE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-glaze-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isGlaze ? (
              <Badge variant="outline">I will not glaze it</Badge>
            ) : (
              <Badge variant="ghost">Glaze not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Glaze paper
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
            {sheet.isGlaze
              ? "Still for sale. Seller taped the glaze note. Status stays available. Not a kiln."
              : "Still a chip. Still a mug. Tape it when walkers still want a fired coat over the rim."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGlaze ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not glaze it"
              title={GLAZE_NOTICE_TITLE}
              body={`${GLAZE_STILL_LINE} avail=open still lists this mug.`}
            />
          ) : (
            <ListingGlazeEmpty listingId={sheet.listingId} />
          )}

          <GlazeForm listingId={sheet.listingId} isGlaze={sheet.isGlaze} />

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
