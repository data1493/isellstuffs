import Link from "next/link";

import { ListingBentEmpty } from "@/components/listing-bent-empty";
import { SyncBent } from "@/components/listing-bent-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BENT_FITS_LINE,
  BENT_HEAT_LINE,
  BENT_MIRROR_SCRIPT,
  BENT_REFUSE_COPY,
  BENT_STILL_LINE,
  BENT_TABLE_LINE,
  BENT_TOTE_LINE,
  BENT_WHISK_LINE,
} from "@/lib/listing-bent";
import { listingBentWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BentViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type BentViewSheet = {
  kind: BentViewKind;
  listingId: string;
  isBent: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BentMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BENT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BentRefused({ sheet }: { sheet: BentViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-bent-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={BENT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Leave it bent is for a balloon whisk on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BENT_TABLE_LINE} {BENT_HEAT_LINE} {BENT_FITS_LINE}{" "}
              {BENT_WHISK_LINE} {BENT_STILL_LINE}
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

function BentForm({
  listingId,
  isBent,
}: {
  listingId: string;
  isBent: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBentWritePath()}
      className="space-y-3"
      data-bent-form={isBent ? "open" : "bent"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBent ? "open" : "bent"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/bent`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBent ? "Still a balloon" : "Leave the balloon gone"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBent
          ? "Clear the tape. Status and the tote stay put."
          : `${BENT_HEAT_LINE} ${BENT_FITS_LINE} ${BENT_WHISK_LINE} ${BENT_STILL_LINE} ${BENT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBentView({
  sheet,
  bentIds,
}: {
  sheet: BentViewSheet;
  bentIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BentMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BentRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-bent-sheet="physical"
      data-bent-state={sheet.isBent ? "bent" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BENT_MIRROR_SCRIPT }} />
      <SyncBent listingIds={bentIds} />

      <MallHero>
        <MallCrumb label="Leave it bent">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Bent</span>
        </MallCrumb>

        <MallEyebrow>Leave it bent</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBent ? BENT_TABLE_LINE : "Leave it bent."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BENT_TABLE_LINE} {BENT_HEAT_LINE} {BENT_FITS_LINE} {BENT_WHISK_LINE}{" "}
            {BENT_STILL_LINE} {BENT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-bent-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBent ? (
              <Badge variant="outline">Leave it bent</Badge>
            ) : (
              <Badge variant="ghost">Still a balloon</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Balloon whisk
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
            {sheet.isBent
              ? "Still for sale. Seller taped a splayed whisk. Walkers still bag it. Status stays available."
              : "Heat is the mug. Fits is the lid. Tape the splay when the balloon is gone."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBent ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Leave it bent"
              title={BENT_TABLE_LINE}
              body={`${BENT_STILL_LINE} avail=open still lists this pile. ${BENT_WHISK_LINE}`}
            />
          ) : (
            <ListingBentEmpty listingId={sheet.listingId} />
          )}

          <BentForm listingId={sheet.listingId} isBent={sheet.isBent} />

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
