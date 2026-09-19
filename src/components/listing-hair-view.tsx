import Link from "next/link";

import { ListingHairEmpty } from "@/components/listing-hair-empty";
import { SyncHair } from "@/components/listing-hair-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HAIR_MIRROR_SCRIPT,
  HAIR_REFUSE_COPY,
  HAIR_SMOKE_LINE,
  HAIR_STAYS_LINE,
  HAIR_STILL_LINE,
  HAIR_TABLE_LINE,
  HAIR_TOTE_LINE,
  HAIR_WASH_LINE,
} from "@/lib/listing-hair";
import { listingHairWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HairViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type HairViewSheet = {
  kind: HairViewKind;
  listingId: string;
  isHair: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HairMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HAIR_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HairRefused({ sheet }: { sheet: HairViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-hair-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={HAIR_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Pet-hair honesty is for furniture and textiles on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {HAIR_TABLE_LINE} {HAIR_SMOKE_LINE} {HAIR_WASH_LINE} {HAIR_STILL_LINE}
            </p>
          </div>
        }
        actions={
          <>
            {sheet.listing ? (
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath(sheet.listing.id)} />}
              >
                Back to the listing
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-full px-5"
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

function HairForm({
  listingId,
  isHair,
}: {
  listingId: string;
  isHair: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHairWritePath()}
      className="space-y-3"
      data-hair-form={isHair ? "open" : "hair"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isHair ? "open" : "hair"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/hair`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isHair ? "Hair is off the tape" : "Pet hair stays"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isHair
          ? "Clear the tape. Status and the tote stay put."
          : `${HAIR_STAYS_LINE} ${HAIR_STILL_LINE} ${HAIR_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingHairView({
  sheet,
  hairIds,
}: {
  sheet: HairViewSheet;
  hairIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HairMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HairRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-hair-sheet="physical"
      data-hair-state={sheet.isHair ? "hair" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HAIR_MIRROR_SCRIPT }} />
      <SyncHair listingIds={hairIds} />

      <MallHero>
        <MallCrumb label="Pet hair stays">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Hair</span>
        </MallCrumb>

        <MallEyebrow>Pet-hair honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isHair ? HAIR_TABLE_LINE : "Pet hair stays."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HAIR_TABLE_LINE} {HAIR_SMOKE_LINE} {HAIR_WASH_LINE} {HAIR_STAYS_LINE}{" "}
            {HAIR_STILL_LINE} {HAIR_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-hair-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isHair ? (
              <Badge variant="outline">Pet hair stays</Badge>
            ) : (
              <Badge variant="ghost">Hair not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Pet-hair tag
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
            {sheet.isHair
              ? "Still for sale. Seller taped the pet hair. Status stays available. Not a fourth status."
              : "Smoke is the jacket smell. Wash is I washed it. Tape the hair when the furniture or textile already holds it."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isHair ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Pet hair stays"
              title={HAIR_TABLE_LINE}
              body={`${HAIR_STAYS_LINE} ${HAIR_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingHairEmpty listingId={sheet.listingId} />
          )}

          <HairForm listingId={sheet.listingId} isHair={sheet.isHair} />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={listingPath(sheet.listingId)} />}
            >
              Back to the listing
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              render={<Link href={exploreHref({ avail: "open" })} />}
            >
              Still here on the concourse
            </Button>
            {stallHref ? (
              <Button
                variant="outline"
                className="w-full rounded-full sm:w-auto"
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
