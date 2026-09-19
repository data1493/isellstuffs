import Link from "next/link";

import { ListingZipEmpty } from "@/components/listing-zip-empty";
import { SyncZip } from "@/components/listing-zip-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  ZIP_BURN_LINE,
  ZIP_DISC_LINE,
  ZIP_FOLDER_LINE,
  ZIP_INK_LINE,
  ZIP_MIRROR_SCRIPT,
  ZIP_NOTICE_TITLE,
  ZIP_REFUSE_COPY,
  ZIP_STICK_LINE,
  ZIP_STILL_LINE,
  ZIP_TABLE_LINE,
  ZIP_TOTE_LINE,
} from "@/lib/listing-zip";
import { listingPath, listingZipWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ZipViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ZipViewSheet = {
  kind: ZipViewKind;
  listingId: string;
  isZip: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ZipMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ZIP_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ZipRefused({ sheet }: { sheet: ZipViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-zip-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={ZIP_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Zip honesty is for a leftover disc on the table, not a sample-pack zip and not a gift code."
              )}
            </p>
            <p>
              {ZIP_NOTICE_TITLE} {ZIP_STICK_LINE} {ZIP_STILL_LINE}
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

function ZipForm({
  listingId,
  isZip,
}: {
  listingId: string;
  isZip: boolean;
}) {
  return (
    <form
      method="post"
      action={listingZipWritePath()}
      className="space-y-3"
      data-zip-form={isZip ? "open" : "zip"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isZip ? "open" : "zip"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/zip`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isZip ? "Leave the disc" : "I don't have the zip"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isZip
          ? "Clear the zip paper. Status and the tote stay put."
          : `${ZIP_DISC_LINE} ${ZIP_FOLDER_LINE} ${ZIP_STILL_LINE} ${ZIP_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingZipView({
  sheet,
  zipIds,
}: {
  sheet: ZipViewSheet;
  zipIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ZipMissing />;
  }

  if (sheet.kind !== "physical") {
    return <ZipRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-zip-sheet="physical"
      data-zip-state={sheet.isZip ? "zip" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: ZIP_MIRROR_SCRIPT }} />
      <SyncZip listingIds={zipIds} />

      <MallHero>
        <MallCrumb label="I don't have the zip">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Zip</span>
        </MallCrumb>

        <MallEyebrow>I don't have the zip</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isZip ? ZIP_NOTICE_TITLE : ZIP_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ZIP_NOTICE_TITLE} {ZIP_STICK_LINE} {ZIP_BURN_LINE} {ZIP_INK_LINE}{" "}
            {ZIP_FOLDER_LINE} {ZIP_STILL_LINE} {ZIP_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-zip-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isZip ? (
              <Badge variant="outline">I don't have the zip</Badge>
            ) : (
              <Badge variant="ghost">Zip not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Zip paper
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
            {sheet.isZip
              ? "Still for sale. Seller does not have the leftover zip in the jewel. Status stays available. Not a USB shop."
              : "Stick is the email. Burn is no fresh disc. Ink is the Sharpie. Tape it when walkers want the folder zip in the case."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isZip ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't have the zip"
              title={ZIP_NOTICE_TITLE}
              body={`${ZIP_DISC_LINE} ${ZIP_FOLDER_LINE} ${ZIP_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingZipEmpty listingId={sheet.listingId} />
          )}

          <ZipForm listingId={sheet.listingId} isZip={sheet.isZip} />

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
