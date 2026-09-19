import Link from "next/link";

import { ListingWashEmpty } from "@/components/listing-wash-empty";
import { SyncWash } from "@/components/listing-wash-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  WASH_JACKET_LINE,
  WASH_MIRROR_SCRIPT,
  WASH_REFUSE_COPY,
  WASH_SIZE_LINE,
  WASH_SMOKE_LINE,
  WASH_STILL_LINE,
  WASH_TABLE_LINE,
  WASH_TOTE_LINE,
} from "@/lib/listing-wash";
import { listingPath, listingWashWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type WashViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type WashViewSheet = {
  kind: WashViewKind;
  listingId: string;
  isWash: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function WashMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={WASH_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function WashRefused({ sheet }: { sheet: WashViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-wash-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={WASH_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I washed it is for a jacket on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {WASH_TABLE_LINE} {WASH_SMOKE_LINE} {WASH_SIZE_LINE}{" "}
              {WASH_JACKET_LINE} {WASH_STILL_LINE}
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

function WashForm({
  listingId,
  isWash,
}: {
  listingId: string;
  isWash: boolean;
}) {
  return (
    <form
      method="post"
      action={listingWashWritePath()}
      className="space-y-3"
      data-wash-form={isWash ? "open" : "wash"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isWash ? "open" : "wash"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/wash`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isWash ? "Still a car smell" : "I washed it once"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isWash
          ? "Clear the laundry paper. Status and the tote stay put."
          : `${WASH_SMOKE_LINE} ${WASH_SIZE_LINE} ${WASH_JACKET_LINE} ${WASH_STILL_LINE} ${WASH_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingWashView({
  sheet,
  washIds,
}: {
  sheet: WashViewSheet;
  washIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <WashMissing />;
  }

  if (sheet.kind !== "physical") {
    return <WashRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-wash-sheet="physical"
      data-wash-state={sheet.isWash ? "wash" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: WASH_MIRROR_SCRIPT }} />
      <SyncWash listingIds={washIds} />

      <MallHero>
        <MallCrumb label="I washed it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Wash</span>
        </MallCrumb>

        <MallEyebrow>I washed it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isWash ? WASH_TABLE_LINE : "I washed it."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {WASH_TABLE_LINE} {WASH_SMOKE_LINE} {WASH_SIZE_LINE} {WASH_JACKET_LINE}{" "}
            {WASH_STILL_LINE} {WASH_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-wash-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isWash ? (
              <Badge variant="outline">I washed it</Badge>
            ) : (
              <Badge variant="ghost">Still a car smell</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Laundry paper
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
            {sheet.isWash
              ? "Still for sale. Seller taped the laundry paper. Walkers still try it on. Status stays available."
              : "Smoke is the smell. Size is the tag. Tape the wash when the jacket went through a machine."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isWash ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I washed it"
              title={WASH_TABLE_LINE}
              body={`${WASH_STILL_LINE} avail=open still lists this pile. ${WASH_JACKET_LINE}`}
            />
          ) : (
            <ListingWashEmpty listingId={sheet.listingId} />
          )}

          <WashForm listingId={sheet.listingId} isWash={sheet.isWash} />

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
