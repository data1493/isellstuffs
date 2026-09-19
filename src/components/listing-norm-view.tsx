import Link from "next/link";

import { ListingNormEmpty } from "@/components/listing-norm-empty";
import { SyncNorm } from "@/components/listing-norm-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  NORM_MIRROR_SCRIPT,
  NORM_NOTICE_TITLE,
  NORM_REFUSE_COPY,
  NORM_STAYS_LINE,
  NORM_STILL_LINE,
  NORM_TABLE_LINE,
  NORM_TOTE_LINE,
  NORM_WALK_LINE,
} from "@/lib/listing-norm";
import { listingNormWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type NormViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type NormViewSheet = {
  kind: NormViewKind;
  listingId: string;
  isNorm: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function NormMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={NORM_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function NormRefused({ sheet }: { sheet: NormViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-norm-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={NORM_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I will not normalize is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {NORM_NOTICE_TITLE} {NORM_WALK_LINE} {NORM_STILL_LINE}
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

function NormForm({
  listingId,
  isNorm,
}: {
  listingId: string;
  isNorm: boolean;
}) {
  return (
    <form
      method="post"
      action={listingNormWritePath()}
      className="space-y-3"
      data-norm-form={isNorm ? "open" : "norm"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isNorm ? "open" : "norm"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/norm`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isNorm ? "Leave it as recorded" : "I will not normalize"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isNorm
          ? "Clear the normalize paper. Status and the tote stay put."
          : `${NORM_STAYS_LINE} ${NORM_WALK_LINE} ${NORM_STILL_LINE} ${NORM_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingNormView({
  sheet,
  normIds,
}: {
  sheet: NormViewSheet;
  normIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <NormMissing />;
  }

  if (sheet.kind !== "digital") {
    return <NormRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-norm-sheet="digital"
      data-norm-state={sheet.isNorm ? "norm" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: NORM_MIRROR_SCRIPT }} />
      <SyncNorm listingIds={normIds} />

      <MallHero>
        <MallCrumb label="I will not normalize">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Norm</span>
        </MallCrumb>

        <MallEyebrow>I will not normalize</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isNorm ? NORM_NOTICE_TITLE : NORM_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {NORM_NOTICE_TITLE} {NORM_WALK_LINE} {NORM_STILL_LINE} {NORM_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-norm-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isNorm ? (
              <Badge variant="outline">I will not normalize</Badge>
            ) : (
              <Badge variant="ghost">Still as recorded</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Normalize paper
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
            {sheet.isNorm
              ? "Still for sale. Seller taped that the kicks stay as recorded. Walkers still ask Beats to make them the same loud. Status stays available."
              : "As recorded. Tape it when walkers still want the kicks the same loud."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isNorm ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not normalize"
              title={NORM_NOTICE_TITLE}
              body={`${NORM_STILL_LINE} avail=open still lists this file. ${NORM_STAYS_LINE}`}
            />
          ) : (
            <ListingNormEmpty listingId={sheet.listingId} />
          )}

          <NormForm listingId={sheet.listingId} isNorm={sheet.isNorm} />

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
