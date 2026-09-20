import Link from "next/link";

import { ListingStrainEmpty } from "@/components/listing-strain-empty";
import { SyncStrain } from "@/components/listing-strain-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  STRAIN_CHARGER_LINE,
  STRAIN_LEAVE_LINE,
  STRAIN_MIRROR_SCRIPT,
  STRAIN_NOTICE_TITLE,
  STRAIN_REFUSE_COPY,
  STRAIN_STAYS_LINE,
  STRAIN_STILL_LINE,
  STRAIN_TABLE_LINE,
  STRAIN_TOTE_LINE,
  STRAIN_USB_LINE,
  STRAIN_WALK_LINE,
} from "@/lib/listing-strain";
import { listingPath, listingStrainWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type StrainViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing"
  | "boy"
  | "cdr"
  | "chair"
  | "owned";

export type StrainViewSheet = {
  kind: StrainViewKind;
  listingId: string;
  isStrain: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function StrainMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={STRAIN_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function StrainRefused({ sheet }: { sheet: StrainViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const boy = sheet.kind === "boy";
  const cdr = sheet.kind === "cdr";
  const chair = sheet.kind === "chair";
  const owned = sheet.kind === "owned";

  return (
    <div data-strain-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={
          gift
            ? "Gift desk"
            : file
              ? "Files stay in the folder"
              : boy
                ? "A Game Boy is not a cable pile"
                : cdr
                  ? "A burned disc is not a cable pile"
                  : chair
                    ? "A chair is not a cable pile"
                    : owned
                      ? "Another note already owns that one"
                      : "Walked"
        }
        title={STRAIN_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A strain note is for the mystery cable drawer on the table, not a LUT and not a gift code."
              )}
            </p>
            <p>
              {STRAIN_TABLE_LINE} {STRAIN_USB_LINE} {STRAIN_CHARGER_LINE}{" "}
              {STRAIN_STILL_LINE}
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

function StrainForm({
  listingId,
  isStrain,
}: {
  listingId: string;
  isStrain: boolean;
}) {
  return (
    <form
      method="post"
      action={listingStrainWritePath()}
      className="space-y-3"
      data-strain-form={isStrain ? "open" : "strain"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isStrain ? "open" : "strain"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/strain`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isStrain ? STRAIN_LEAVE_LINE : STRAIN_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isStrain
          ? "Clear the tape. Status and the tote stay put."
          : `${STRAIN_STAYS_LINE} ${STRAIN_USB_LINE} ${STRAIN_CHARGER_LINE} ${STRAIN_STILL_LINE} ${STRAIN_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingStrainView({
  sheet,
  strainIds,
}: {
  sheet: StrainViewSheet;
  strainIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <StrainMissing />;
  }

  if (sheet.kind !== "physical") {
    return <StrainRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-strain-sheet="physical"
      data-strain-state={sheet.isStrain ? "strain" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: STRAIN_MIRROR_SCRIPT }} />
      <SyncStrain listingIds={strainIds} />

      <MallHero>
        <MallCrumb label="I will not strain them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Strain</span>
        </MallCrumb>

        <MallEyebrow>I will not strain them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isStrain ? STRAIN_NOTICE_TITLE : STRAIN_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {STRAIN_TABLE_LINE} {STRAIN_USB_LINE} {STRAIN_CHARGER_LINE}{" "}
            {STRAIN_WALK_LINE} {STRAIN_STAYS_LINE} {STRAIN_STILL_LINE}{" "}
            {STRAIN_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-strain-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isStrain ? (
              <Badge variant="outline">I will not strain them</Badge>
            ) : (
              <Badge variant="ghost">Strain not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Strain paper
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
            {sheet.isStrain
              ? "Still for sale. Seller taped the strain note. Status stays available. Not a shop boot."
              : "Still mystery USB. Still a forgotten charger. Tape it when walkers still want the honest ends booted."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isStrain ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not strain them"
              title={STRAIN_NOTICE_TITLE}
              body={`${STRAIN_STILL_LINE} avail=open still lists this drawer.`}
            />
          ) : (
            <ListingStrainEmpty listingId={sheet.listingId} />
          )}

          <StrainForm listingId={sheet.listingId} isStrain={sheet.isStrain} />

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
