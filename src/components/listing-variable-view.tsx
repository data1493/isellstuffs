import Link from "next/link";

import { ListingVariableEmpty } from "@/components/listing-variable-empty";
import { SyncVariable } from "@/components/listing-variable-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  VARIABLE_ALMOST_LINE,
  VARIABLE_LEAVE_LINE,
  VARIABLE_MIRROR_SCRIPT,
  VARIABLE_NOTICE_TITLE,
  VARIABLE_REFUSE_COPY,
  VARIABLE_STAYS_LINE,
  VARIABLE_STILL_LINE,
  VARIABLE_TABLE_LINE,
  VARIABLE_TOTE_LINE,
  VARIABLE_WALK_LINE,
  VARIABLE_WEIGHTS_LINE,
} from "@/lib/listing-variable";
import { listingPath, listingVariableWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type VariableViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type VariableViewSheet = {
  kind: VariableViewKind;
  listingId: string;
  isVariable: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function VariableMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={VARIABLE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function VariableRefused({ sheet }: { sheet: VariableViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-variable-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={VARIABLE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Variable honesty is for a file on the digital lot, not a Game Boy and not a gift code."
              )}
            </p>
            <p>
              {VARIABLE_TABLE_LINE} {VARIABLE_WEIGHTS_LINE} {VARIABLE_ALMOST_LINE}{" "}
              {VARIABLE_STILL_LINE}
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

function VariableForm({
  listingId,
  isVariable,
}: {
  listingId: string;
  isVariable: boolean;
}) {
  return (
    <form
      method="post"
      action={listingVariableWritePath()}
      className="space-y-3"
      data-variable-form={isVariable ? "open" : "variable"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isVariable ? "open" : "variable"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/variable`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isVariable ? VARIABLE_LEAVE_LINE : VARIABLE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isVariable
          ? "Clear the tape. Status and the tote stay put."
          : `${VARIABLE_STAYS_LINE} ${VARIABLE_WEIGHTS_LINE} ${VARIABLE_ALMOST_LINE} ${VARIABLE_STILL_LINE} ${VARIABLE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingVariableView({
  sheet,
  variableIds,
}: {
  sheet: VariableViewSheet;
  variableIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <VariableMissing />;
  }

  if (sheet.kind !== "digital") {
    return <VariableRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-variable-sheet="digital"
      data-variable-state={sheet.isVariable ? "variable" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: VARIABLE_MIRROR_SCRIPT }} />
      <SyncVariable listingIds={variableIds} />

      <MallHero>
        <MallCrumb label="I will not variable it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Variable</span>
        </MallCrumb>

        <MallEyebrow>I will not variable it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isVariable ? VARIABLE_NOTICE_TITLE : VARIABLE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {VARIABLE_TABLE_LINE} {VARIABLE_WEIGHTS_LINE} {VARIABLE_ALMOST_LINE}{" "}
            {VARIABLE_WALK_LINE} {VARIABLE_STAYS_LINE} {VARIABLE_STILL_LINE}{" "}
            {VARIABLE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-variable-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isVariable ? (
              <Badge variant="outline">I will not variable it</Badge>
            ) : (
              <Badge variant="ghost">Still almost-bold</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Variable paper
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
            {sheet.isVariable
              ? "Still for sale. Seller taped the variable note. Status stays available. Not a type shop."
              : "Two weights. Still almost-bold. Tape it when walkers still want a variable font."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isVariable ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not variable it"
              title={VARIABLE_NOTICE_TITLE}
              body={`${VARIABLE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingVariableEmpty listingId={sheet.listingId} />
          )}

          <VariableForm listingId={sheet.listingId} isVariable={sheet.isVariable} />

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
