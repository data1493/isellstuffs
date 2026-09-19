import Link from "next/link";

import { SyncVan } from "@/components/listing-van-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  listingPath,
  listingVanWritePath,
  stallPath,
} from "@/lib/paths";
import { cn } from "@/lib/utils";
import {
  VAN_FILE_COPY,
  VAN_GARAGE_LINE,
  VAN_GIFT_COPY,
  VAN_GONE_COPY,
  VAN_LOOK_LINE,
  VAN_MIRROR_SCRIPT,
  VAN_MISSING_COPY,
  VAN_SOLD_COPY,
  VAN_TABLE_LINE,
  VAN_TOTE_LINE,
} from "@/lib/van-restock";

export type VanViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type VanViewSheet = {
  kind: VanViewKind;
  listingId: string;
  inVan: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function VanMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={VAN_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function VanRefused({ sheet }: { sheet: VanViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const title = gift
    ? VAN_GIFT_COPY
    : file
      ? sheet.kind === "file-gone"
        ? VAN_GONE_COPY
        : VAN_FILE_COPY
      : VAN_SOLD_COPY;

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={title}
      body={
        <div className="space-y-2" data-van-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "The van holds another tangle, not a PDF and not a gift code."
            )}
          </p>
          <p>{VAN_TABLE_LINE}</p>
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
  );
}

function VanForm({
  listingId,
  inVan,
}: {
  listingId: string;
  inVan: boolean;
}) {
  return (
    <form
      method="post"
      action={listingVanWritePath()}
      className="space-y-3"
      data-van-form={inVan ? "table" : "van"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={inVan ? "table" : "van"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/van`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {inVan ? "Just this pile" : "More in the van"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {inVan
          ? "Clear the van note. Status and the tote stay put."
          : `${VAN_TOTE_LINE} ${VAN_GARAGE_LINE} ${VAN_LOOK_LINE}`}
      </p>
    </form>
  );
}

export function ListingVanView({
  sheet,
  vanIds,
}: {
  sheet: VanViewSheet;
  vanIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <VanMissing />;
  }

  if (sheet.kind !== "physical") {
    return <VanRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-van-sheet="physical"
      data-van-state={sheet.inVan ? "van" : "table"}
    >
      <script dangerouslySetInnerHTML={{ __html: VAN_MIRROR_SCRIPT }} />
      <SyncVan listingIds={vanIds} />

      <MallHero>
        <MallCrumb label="More in the van">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Van</span>
        </MallCrumb>

        <MallEyebrow>Out back</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.inVan ? VAN_TABLE_LINE : "More in the van."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {VAN_TABLE_LINE} {VAN_TOTE_LINE} {VAN_GARAGE_LINE} {VAN_LOOK_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-van-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.inVan ? (
              <Badge variant="outline">More in the van</Badge>
            ) : (
              <Badge variant="ghost">This pile only</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Asking tag
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
            {sheet.inVan
              ? "The last USB can walk. There is still a tangle in the van. Ask. Status stays available."
              : "The pile on the table is what you see. Tape the van when more is out back."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.inVan ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="More in the van"
              title={VAN_TABLE_LINE}
              body={`${VAN_TOTE_LINE} avail=open still lists this pile. Garage is home.`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="This pile only"
              title="Nobody asked the van yet."
              body="Tape a van note when more is out back. It does not pack the booth or mark it sold."
            />
          )}

          <VanForm listingId={sheet.listingId} inVan={sheet.inVan} />

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
