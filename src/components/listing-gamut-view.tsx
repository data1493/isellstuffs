import Link from "next/link";

import { ListingGamutEmpty } from "@/components/listing-gamut-empty";
import { SyncGamut } from "@/components/listing-gamut-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GAMUT_FLUOR_LINE,
  GAMUT_LEAVE_LINE,
  GAMUT_LOT_LINE,
  GAMUT_MIRROR_SCRIPT,
  GAMUT_NOTICE_TITLE,
  GAMUT_REFUSE_COPY,
  GAMUT_STAYS_LINE,
  GAMUT_STILL_LINE,
  GAMUT_TABLE_LINE,
  GAMUT_TOTE_LINE,
  GAMUT_WALK_LINE,
} from "@/lib/listing-gamut";
import { listingGamutWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GamutViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "pack"
  | "font"
  | "pdf"
  | "chair"
  | "owned";

export type GamutViewSheet = {
  kind: GamutViewKind;
  listingId: string;
  isGamut: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GamutMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GAMUT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GamutRefused({ sheet }: { sheet: GamutViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";
  const pack = sheet.kind === "pack";
  const font = sheet.kind === "font";
  const pdf = sheet.kind === "pdf";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-gamut-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : pack
              ? "A pack is not a LUT"
              : font
                ? "A font is not a LUT"
                : pdf
                  ? "A junk PDF is not a LUT"
                  : chair
                    ? "A chair is not a LUT"
                    : owned
                      ? "Another note already owns that one"
                      : object
                        ? "On the table"
                        : "Walked"
        }
        title={GAMUT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A gamut note is for the parking-lot LUT pack, not a pack and not a gift code."
              )}
            </p>
            <p>
              {GAMUT_TABLE_LINE} {GAMUT_LOT_LINE} {GAMUT_FLUOR_LINE}{" "}
              {GAMUT_STILL_LINE}
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

function GamutForm({
  listingId,
  isGamut,
}: {
  listingId: string;
  isGamut: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGamutWritePath()}
      className="space-y-3"
      data-gamut-form={isGamut ? "open" : "gamut"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isGamut ? "open" : "gamut"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/gamut`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGamut ? GAMUT_LEAVE_LINE : GAMUT_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGamut
          ? "Clear the tape. Status and the tote stay put."
          : `${GAMUT_STAYS_LINE} ${GAMUT_LOT_LINE} ${GAMUT_FLUOR_LINE} ${GAMUT_STILL_LINE} ${GAMUT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGamutView({
  sheet,
  gamutIds,
}: {
  sheet: GamutViewSheet;
  gamutIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GamutMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GamutRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-gamut-sheet="digital"
      data-gamut-state={sheet.isGamut ? "gamut" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GAMUT_MIRROR_SCRIPT }} />
      <SyncGamut listingIds={gamutIds} />

      <MallHero>
        <MallCrumb label="I will not gamut it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Gamut</span>
        </MallCrumb>

        <MallEyebrow>I will not gamut it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGamut ? GAMUT_NOTICE_TITLE : GAMUT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GAMUT_TABLE_LINE} {GAMUT_LOT_LINE} {GAMUT_FLUOR_LINE}{" "}
            {GAMUT_WALK_LINE} {GAMUT_STAYS_LINE} {GAMUT_STILL_LINE}{" "}
            {GAMUT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-gamut-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGamut ? (
              <Badge variant="outline">I will not gamut it</Badge>
            ) : (
              <Badge variant="ghost">Gamut not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Gamut paper
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
            {sheet.isGamut
              ? "Still for sale. Seller taped the gamut note. Status stays available. Not a color shop. Not an account."
              : "Still a parking lot. Still fluorescent. Tape it when walkers still want shop-legal primaries."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGamut ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not gamut it"
              title={GAMUT_NOTICE_TITLE}
              body={`${GAMUT_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingGamutEmpty listingId={sheet.listingId} />
          )}

          <GamutForm listingId={sheet.listingId} isGamut={sheet.isGamut} />

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
