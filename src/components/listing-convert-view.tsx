import Link from "next/link";

import { ListingConvertEmpty } from "@/components/listing-convert-empty";
import { SyncConvert } from "@/components/listing-convert-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CONVERT_CUBE_LINE,
  CONVERT_FORMAT_LINE,
  CONVERT_GRADE_LINE,
  CONVERT_MIRROR_SCRIPT,
  CONVERT_REFUSE_COPY,
  CONVERT_STILL_LINE,
  CONVERT_TABLE_LINE,
  CONVERT_TOTE_LINE,
} from "@/lib/listing-convert";
import { listingConvertWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ConvertViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ConvertViewSheet = {
  kind: ConvertViewKind;
  listingId: string;
  isConvert: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ConvertMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CONVERT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function ConvertRefused({ sheet }: { sheet: ConvertViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-convert-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={CONVERT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I don't convert is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {CONVERT_TABLE_LINE} {CONVERT_CUBE_LINE} {CONVERT_GRADE_LINE}{" "}
              {CONVERT_FORMAT_LINE} {CONVERT_STILL_LINE}
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

function ConvertForm({
  listingId,
  isConvert,
}: {
  listingId: string;
  isConvert: boolean;
}) {
  return (
    <form
      method="post"
      action={listingConvertWritePath()}
      className="space-y-3"
      data-convert-form={isConvert ? "open" : "convert"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isConvert ? "open" : "convert"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/convert`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isConvert ? "Take the convert tape off" : "I don't convert"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isConvert
          ? "Clear the convert paper. Status and the tote stay put."
          : `${CONVERT_CUBE_LINE} ${CONVERT_GRADE_LINE} ${CONVERT_FORMAT_LINE} ${CONVERT_STILL_LINE} ${CONVERT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingConvertView({
  sheet,
  convertIds,
}: {
  sheet: ConvertViewSheet;
  convertIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ConvertMissing />;
  }

  if (sheet.kind !== "digital") {
    return <ConvertRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-convert-sheet="digital"
      data-convert-state={sheet.isConvert ? "convert" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CONVERT_MIRROR_SCRIPT }} />
      <SyncConvert listingIds={convertIds} />

      <MallHero>
        <MallCrumb label="I don't convert">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Convert</span>
        </MallCrumb>

        <MallEyebrow>I don't convert</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isConvert ? CONVERT_TABLE_LINE : "I don't convert."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CONVERT_TABLE_LINE} {CONVERT_CUBE_LINE} {CONVERT_GRADE_LINE}{" "}
            {CONVERT_FORMAT_LINE} {CONVERT_STILL_LINE} {CONVERT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-convert-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isConvert ? (
              <Badge variant="outline">Stays .cube</Badge>
            ) : (
              <Badge variant="ghost">Open to convert</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Convert paper
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
            {sheet.isConvert
              ? "Still for sale. Seller taped the cubes stay cubes. Walkers still ask Beats to transcode. Status stays available."
              : "Grade is I don't grade. Tape the convert when the LUT pack stays .cube."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isConvert ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't convert"
              title={CONVERT_TABLE_LINE}
              body={`${CONVERT_STILL_LINE} avail=open still lists this file. ${CONVERT_CUBE_LINE}`}
            />
          ) : (
            <ListingConvertEmpty listingId={sheet.listingId} />
          )}

          <ConvertForm listingId={sheet.listingId} isConvert={sheet.isConvert} />

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
