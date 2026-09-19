import Link from "next/link";

import { ListingConsultEmpty } from "@/components/listing-consult-empty";
import { SyncConsult } from "@/components/listing-consult-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  CONSULT_MIRROR_SCRIPT,
  CONSULT_NOTICE_TITLE,
  CONSULT_ONE_LINE,
  CONSULT_REFUSE_COPY,
  CONSULT_RULE_LINE,
  CONSULT_STILL_LINE,
  CONSULT_TABLE_LINE,
  CONSULT_TOTE_LINE,
  CONSULT_WALK_LINE,
} from "@/lib/listing-consult";
import { listingConsultWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type ConsultViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type ConsultViewSheet = {
  kind: ConsultViewKind;
  listingId: string;
  isConsult: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function ConsultMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={CONSULT_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button
          className="h-11 w-full rounded-full px-5 sm:w-auto"
          render={<Link href="/explore" />}
        >
          Walk the concourse
        </Button>
      }
    />
  );
}

function ConsultRefused({ sheet }: { sheet: ConsultViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-consult-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={CONSULT_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "I don't consult is for a file on the digital lot, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {CONSULT_NOTICE_TITLE} {CONSULT_WALK_LINE} {CONSULT_STILL_LINE}
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

function ConsultForm({
  listingId,
  isConsult,
}: {
  listingId: string;
  isConsult: boolean;
}) {
  return (
    <form
      method="post"
      action={listingConsultWritePath()}
      className="space-y-3"
      data-consult-form={isConsult ? "open" : "consult"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isConsult ? "open" : "consult"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/consult`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isConsult ? "Leave the rule of thumb" : "I don't consult"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isConsult
          ? "Clear the consult paper. Status and the tote stay put."
          : `${CONSULT_ONE_LINE} ${CONSULT_RULE_LINE} ${CONSULT_WALK_LINE} ${CONSULT_STILL_LINE} ${CONSULT_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingConsultView({
  sheet,
  consultIds,
}: {
  sheet: ConsultViewSheet;
  consultIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <ConsultMissing />;
  }

  if (sheet.kind !== "digital") {
    return <ConsultRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-consult-sheet="digital"
      data-consult-state={sheet.isConsult ? "consult" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: CONSULT_MIRROR_SCRIPT }} />
      <SyncConsult listingIds={consultIds} />

      <MallHero>
        <MallCrumb label="I don't consult">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Consult</span>
        </MallCrumb>

        <MallEyebrow>I don't consult</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isConsult ? CONSULT_NOTICE_TITLE : CONSULT_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {CONSULT_NOTICE_TITLE} {CONSULT_WALK_LINE} {CONSULT_STILL_LINE}{" "}
            {CONSULT_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-consult-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isConsult ? (
              <Badge variant="outline">I don't consult</Badge>
            ) : (
              <Badge variant="ghost">Still a rule of thumb</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Consult paper
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
            {sheet.isConsult
              ? "Still for sale. Seller taped that they don't consult. Walkers still ask Tuesday to price their pile. Status stays available."
              : "One page. Still a rule of thumb. Tape it when walkers still want a price on their pile."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isConsult ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I don't consult"
              title={CONSULT_NOTICE_TITLE}
              body={`${CONSULT_STILL_LINE} avail=open still lists this file. ${CONSULT_ONE_LINE}`}
            />
          ) : (
            <ListingConsultEmpty listingId={sheet.listingId} />
          )}

          <ConsultForm listingId={sheet.listingId} isConsult={sheet.isConsult} />

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
