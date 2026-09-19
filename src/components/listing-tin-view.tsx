import Link from "next/link";

import { ListingTinEmpty } from "@/components/listing-tin-empty";
import { SyncTin } from "@/components/listing-tin-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TIN_LEAVE_LINE,
  TIN_MIRROR_SCRIPT,
  TIN_NOTICE_TITLE,
  TIN_PILE_LINE,
  TIN_REFUSE_COPY,
  TIN_STAYS_LINE,
  TIN_STILL_LINE,
  TIN_TABLE_LINE,
  TIN_TOTE_LINE,
  TIN_UNTESTED_LINE,
  TIN_WALK_LINE,
} from "@/lib/listing-tin";
import { listingPath, listingTinWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TinViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type TinViewSheet = {
  kind: TinViewKind;
  listingId: string;
  isTin: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TinMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TIN_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TinRefused({ sheet }: { sheet: TinViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-tin-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={TIN_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A tin note is for a pile on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TIN_TABLE_LINE} {TIN_PILE_LINE} {TIN_UNTESTED_LINE} {TIN_STILL_LINE}
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

function TinForm({
  listingId,
  isTin,
}: {
  listingId: string;
  isTin: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTinWritePath()}
      className="space-y-3"
      data-tin-form={isTin ? "open" : "tin"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTin ? "open" : "tin"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/tin`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTin ? TIN_LEAVE_LINE : TIN_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTin
          ? "Clear the tape. Status and the tote stay put."
          : `${TIN_STAYS_LINE} ${TIN_PILE_LINE} ${TIN_UNTESTED_LINE} ${TIN_STILL_LINE} ${TIN_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTinView({
  sheet,
  tinIds,
}: {
  sheet: TinViewSheet;
  tinIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TinMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TinRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-tin-sheet="physical"
      data-tin-state={sheet.isTin ? "tin" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TIN_MIRROR_SCRIPT }} />
      <SyncTin listingIds={tinIds} />

      <MallHero>
        <MallCrumb label="I will not tin them">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Tin</span>
        </MallCrumb>

        <MallEyebrow>I will not tin them</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTin ? TIN_NOTICE_TITLE : TIN_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TIN_TABLE_LINE} {TIN_PILE_LINE} {TIN_UNTESTED_LINE} {TIN_WALK_LINE}{" "}
            {TIN_STAYS_LINE} {TIN_STILL_LINE} {TIN_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-tin-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTin ? (
              <Badge variant="outline">I will not tin them</Badge>
            ) : (
              <Badge variant="ghost">Tin not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tin paper
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
            {sheet.isTin
              ? "Still for sale. Seller taped the tin note. Status stays available. Not a shop."
              : "Still a pile. Still untested. Tape it when walkers still want the ends tinned."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTin ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not tin them"
              title={TIN_NOTICE_TITLE}
              body={`${TIN_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingTinEmpty listingId={sheet.listingId} />
          )}

          <TinForm listingId={sheet.listingId} isTin={sheet.isTin} />

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
