import Link from "next/link";

import { ListingBoxEmpty } from "@/components/listing-box-empty";
import { SyncBox } from "@/components/listing-box-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  BOX_CORD_LINE,
  BOX_MIRROR_SCRIPT,
  BOX_REFUSE_COPY,
  BOX_SHADE_LINE,
  BOX_STILL_LINE,
  BOX_TABLE_LINE,
  BOX_TOTE_LINE,
} from "@/lib/listing-box";
import { listingBoxWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type BoxViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type BoxViewSheet = {
  kind: BoxViewKind;
  listingId: string;
  isBox: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function BoxMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={BOX_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function BoxRefused({ sheet }: { sheet: BoxViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-box-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={BOX_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Shade-in-the-box honesty is for a lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {BOX_TABLE_LINE} {BOX_CORD_LINE} {BOX_STILL_LINE}
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

function BoxForm({
  listingId,
  isBox,
}: {
  listingId: string;
  isBox: boolean;
}) {
  return (
    <form
      method="post"
      action={listingBoxWritePath()}
      className="space-y-3"
      data-box-form={isBox ? "open" : "box"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isBox ? "open" : "box"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/box`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isBox ? "Shade is on the lamp" : "The shade stays in the box"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isBox
          ? "Clear the tape. Status and the tote stay put."
          : `${BOX_SHADE_LINE} ${BOX_STILL_LINE} ${BOX_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingBoxView({
  sheet,
  boxIds,
}: {
  sheet: BoxViewSheet;
  boxIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <BoxMissing />;
  }

  if (sheet.kind !== "physical") {
    return <BoxRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-box-sheet="physical"
      data-box-state={sheet.isBox ? "box" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: BOX_MIRROR_SCRIPT }} />
      <SyncBox listingIds={boxIds} />

      <MallHero>
        <MallCrumb label="The shade stays in the box">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Box</span>
        </MallCrumb>

        <MallEyebrow>Shade-box honesty</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isBox ? BOX_TABLE_LINE : "The shade stays in the box."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {BOX_TABLE_LINE} {BOX_CORD_LINE} {BOX_SHADE_LINE} {BOX_STILL_LINE}{" "}
            {BOX_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-box-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isBox ? (
              <Badge variant="outline">The shade stays in the box</Badge>
            ) : (
              <Badge variant="ghost">Shade not boxed</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Shade-box tag
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
            {sheet.isBox
              ? "Still for sale. Seller taped the packed shade. Status stays available. Not a fourth status."
              : "Cord is rewired. Heavy is two people. Tape the box when the shade already rides separately."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isBox ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="The shade stays in the box"
              title={BOX_TABLE_LINE}
              body={`${BOX_SHADE_LINE} ${BOX_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingBoxEmpty listingId={sheet.listingId} />
          )}

          <BoxForm listingId={sheet.listingId} isBox={sheet.isBox} />

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
