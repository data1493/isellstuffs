import Link from "next/link";

import { SyncAsk } from "@/components/listing-ask-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import {
  ASK_EMPTY_LINE,
  ASK_MIRROR_SCRIPT,
  ASK_REFUSE_COPY,
  ASK_SLEEVE_LINE,
  ASK_STILL_LINE,
  ASK_TABLE_LINE,
  ASK_TOTE_LINE,
} from "@/lib/ask-first";
import { formatMoney, type Listing } from "@/lib/commerce";
import { listingAskWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type AskViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type AskViewSheet = {
  kind: AskViewKind;
  listingId: string;
  isAsk: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function AskMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={ASK_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function AskRefused({ sheet }: { sheet: AskViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={ASK_REFUSE_COPY}
      body={
        <div className="space-y-2" data-ask-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Ask-first is for a sleeve on the table, not a PDF and not a gift code."
            )}
          </p>
          <p>
            {ASK_TABLE_LINE} {ASK_STILL_LINE}
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
  );
}

function AskForm({
  listingId,
  isAsk,
}: {
  listingId: string;
  isAsk: boolean;
}) {
  return (
    <form
      method="post"
      action={listingAskWritePath()}
      className="space-y-3"
      data-ask-form={isAsk ? "flip" : "ask"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isAsk ? "flip" : "ask"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/ask`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isAsk ? "They can flip" : "Ask first"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isAsk
          ? "Clear the ask. Status and the tote stay put."
          : `${ASK_STILL_LINE} ${ASK_TOTE_LINE} ${ASK_SLEEVE_LINE}`}
      </p>
    </form>
  );
}

export function ListingAskView({
  sheet,
  askIds,
}: {
  sheet: AskViewSheet;
  askIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <AskMissing />;
  }

  if (sheet.kind !== "physical") {
    return <AskRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-ask-sheet="physical"
      data-ask-state={sheet.isAsk ? "ask" : "flip"}
    >
      <script dangerouslySetInnerHTML={{ __html: ASK_MIRROR_SCRIPT }} />
      <SyncAsk listingIds={askIds} />

      <MallHero>
        <MallCrumb label="Ask before you flip it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Ask</span>
        </MallCrumb>

        <MallEyebrow>Ask first</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isAsk ? ASK_TABLE_LINE : "Ask before you flip it."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {ASK_TABLE_LINE} {ASK_STILL_LINE} {ASK_TOTE_LINE} {ASK_SLEEVE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-ask-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isAsk ? (
              <Badge variant="outline">Ask first</Badge>
            ) : (
              <Badge variant="ghost">They can flip</Badge>
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
            {sheet.isAsk
              ? "Still for sale. Ask before you flip the sleeve. Status stays available."
              : "Walkers flip it like a cafeteria tray. Tape the ask when the sleeve should stay put."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isAsk ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Ask first"
              title={ASK_TABLE_LINE}
              body={`${ASK_STILL_LINE} avail=open still lists this pile. Look is not for sale.`}
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="They can flip"
              title={ASK_EMPTY_LINE}
              body="Tape an ask when the sleeve should stay put. It does not drop the tote or mark it sold."
            />
          )}

          <AskForm listingId={sheet.listingId} isAsk={sheet.isAsk} />

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
