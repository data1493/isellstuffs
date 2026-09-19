import Link from "next/link";

import { ListingFoundryEmpty } from "@/components/listing-foundry-empty";
import { SyncFoundry } from "@/components/listing-foundry-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  FOUNDRY_EULA_LINE,
  FOUNDRY_LICENSE_LINE,
  FOUNDRY_MIRROR_SCRIPT,
  FOUNDRY_REFUSE_COPY,
  FOUNDRY_STICK_LINE,
  FOUNDRY_STILL_LINE,
  FOUNDRY_TABLE_LINE,
  FOUNDRY_TOTE_LINE,
} from "@/lib/listing-foundry";
import { listingFoundryWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type FoundryViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type FoundryViewSheet = {
  kind: FoundryViewKind;
  listingId: string;
  isFoundry: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function FoundryMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={FOUNDRY_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function FoundryRefused({ sheet }: { sheet: FoundryViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-foundry-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={FOUNDRY_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Not a foundry seat is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {FOUNDRY_TABLE_LINE} {FOUNDRY_LICENSE_LINE} {FOUNDRY_STICK_LINE}{" "}
              {FOUNDRY_EULA_LINE} {FOUNDRY_STILL_LINE}
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

function FoundryForm({
  listingId,
  isFoundry,
}: {
  listingId: string;
  isFoundry: boolean;
}) {
  return (
    <form
      method="post"
      action={listingFoundryWritePath()}
      className="space-y-3"
      data-foundry-form={isFoundry ? "open" : "foundry"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="intent"
        value={isFoundry ? "open" : "foundry"}
      />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/foundry`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isFoundry ? "Take the foundry tape off" : "Not a foundry seat"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isFoundry
          ? "Clear the foundry paper. Status and the tote stay put."
          : `${FOUNDRY_LICENSE_LINE} ${FOUNDRY_STICK_LINE} ${FOUNDRY_EULA_LINE} ${FOUNDRY_STILL_LINE} ${FOUNDRY_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingFoundryView({
  sheet,
  foundryIds,
}: {
  sheet: FoundryViewSheet;
  foundryIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <FoundryMissing />;
  }

  if (sheet.kind !== "digital") {
    return <FoundryRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-foundry-sheet="digital"
      data-foundry-state={sheet.isFoundry ? "foundry" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: FOUNDRY_MIRROR_SCRIPT }} />
      <SyncFoundry listingIds={foundryIds} />

      <MallHero>
        <MallCrumb label="Not a foundry seat">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Foundry</span>
        </MallCrumb>

        <MallEyebrow>Not a foundry seat</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isFoundry ? FOUNDRY_TABLE_LINE : "One booth license."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {FOUNDRY_TABLE_LINE} {FOUNDRY_LICENSE_LINE} {FOUNDRY_STICK_LINE}{" "}
            {FOUNDRY_EULA_LINE} {FOUNDRY_STILL_LINE} {FOUNDRY_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-foundry-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isFoundry ? (
              <Badge variant="outline">Booth license</Badge>
            ) : (
              <Badge variant="ghost">Open to a seat</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Foundry paper
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
            {sheet.isFoundry
              ? "Still for sale. Seller taped one booth license. The OTF is the file. Status stays available."
              : "Stick is no email. Tape the foundry when the mall-directory font is one booth license."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isFoundry ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Not a foundry seat"
              title={FOUNDRY_TABLE_LINE}
              body={`${FOUNDRY_STILL_LINE} avail=open still lists this file. ${FOUNDRY_LICENSE_LINE}`}
            />
          ) : (
            <ListingFoundryEmpty listingId={sheet.listingId} />
          )}

          <FoundryForm
            listingId={sheet.listingId}
            isFoundry={sheet.isFoundry}
          />

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
