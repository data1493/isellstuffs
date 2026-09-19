import Link from "next/link";

import { ListingStretchEmpty } from "@/components/listing-stretch-empty";
import { SyncStretch } from "@/components/listing-stretch-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  STRETCH_LACES_LINE,
  STRETCH_MIRROR_SCRIPT,
  STRETCH_NOTICE_TITLE,
  STRETCH_REFUSE_COPY,
  STRETCH_SOLE_LINE,
  STRETCH_STAYS_LINE,
  STRETCH_STILL_LINE,
  STRETCH_TABLE_LINE,
  STRETCH_TOTE_LINE,
  STRETCH_WALK_LINE,
} from "@/lib/listing-stretch";
import { listingPath, listingStretchWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type StretchViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type StretchViewSheet = {
  kind: StretchViewKind;
  listingId: string;
  isStretch: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function StretchMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={STRETCH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function StretchRefused({ sheet }: { sheet: StretchViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-stretch-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={STRETCH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A stretch refusal is for sneakers on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {STRETCH_TABLE_LINE} {STRETCH_WALK_LINE} {STRETCH_SOLE_LINE}{" "}
              {STRETCH_STILL_LINE}
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

function StretchForm({
  listingId,
  isStretch,
}: {
  listingId: string;
  isStretch: boolean;
}) {
  return (
    <form
      method="post"
      action={listingStretchWritePath()}
      className="space-y-3"
      data-stretch-form={isStretch ? "open" : "stretch"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isStretch ? "open" : "stretch"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/stretch`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isStretch ? "Leave the pair" : "I will not stretch"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isStretch
          ? "Clear the tape. Status and the tote stay put."
          : `${STRETCH_STAYS_LINE} ${STRETCH_WALK_LINE} ${STRETCH_STILL_LINE} ${STRETCH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingStretchView({
  sheet,
  stretchIds,
}: {
  sheet: StretchViewSheet;
  stretchIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <StretchMissing />;
  }

  if (sheet.kind !== "physical") {
    return <StretchRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-stretch-sheet="physical"
      data-stretch-state={sheet.isStretch ? "stretch" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: STRETCH_MIRROR_SCRIPT }} />
      <SyncStretch listingIds={stretchIds} />

      <MallHero>
        <MallCrumb label="I will not stretch">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Stretch</span>
        </MallCrumb>

        <MallEyebrow>Stretch refusal</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isStretch ? STRETCH_NOTICE_TITLE : STRETCH_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {STRETCH_NOTICE_TITLE} {STRETCH_SOLE_LINE} {STRETCH_LACES_LINE}{" "}
            {STRETCH_STAYS_LINE} {STRETCH_STILL_LINE} {STRETCH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-stretch-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isStretch ? (
              <Badge variant="outline">I will not stretch</Badge>
            ) : (
              <Badge variant="ghost">Stretch not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Stretch tag
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
            {sheet.isStretch
              ? "Still for sale. Seller taped the stretch refusal. Status stays available. Not a fourth status."
              : "Sole is no new sole. Tape the refusal when walkers still want them blocked to a 10."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isStretch ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not stretch"
              title={STRETCH_NOTICE_TITLE}
              body={`${STRETCH_STAYS_LINE} ${STRETCH_WALK_LINE} ${STRETCH_STILL_LINE} avail=open still lists this pair.`}
            />
          ) : (
            <ListingStretchEmpty listingId={sheet.listingId} />
          )}

          <StretchForm listingId={sheet.listingId} isStretch={sheet.isStretch} />

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
