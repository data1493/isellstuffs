import Link from "next/link";

import { ListingGateEmpty } from "@/components/listing-gate-empty";
import { SyncGate } from "@/components/listing-gate-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  GATE_LEAVE_LINE,
  GATE_LOOP_LINE,
  GATE_MIRROR_SCRIPT,
  GATE_NOTICE_TITLE,
  GATE_REFUSE_COPY,
  GATE_SHOTS_LINE,
  GATE_STAYS_LINE,
  GATE_STILL_LINE,
  GATE_TABLE_LINE,
  GATE_TOTE_LINE,
  GATE_WALK_LINE,
} from "@/lib/listing-gate";
import { listingGateWritePath, listingPath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type GateViewKind =
  | "digital"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type GateViewSheet = {
  kind: GateViewKind;
  listingId: string;
  isGate: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function GateMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={GATE_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="h-11 w-full rounded-full px-5 sm:w-auto" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function GateRefused({ sheet }: { sheet: GateViewSheet }) {
  const gift = sheet.kind === "gift";
  const object = sheet.kind === "physical" || sheet.kind === "sold";

  return (
    <div data-gate-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : object ? "On the table" : "Walked"}
        title={GATE_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "A gate note is for twelve shots and a loop, not a lamp and not a gift code."
              )}
            </p>
            <p>
              {GATE_TABLE_LINE} {GATE_SHOTS_LINE} {GATE_LOOP_LINE}{" "}
              {GATE_STILL_LINE}
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

function GateForm({
  listingId,
  isGate,
}: {
  listingId: string;
  isGate: boolean;
}) {
  return (
    <form
      method="post"
      action={listingGateWritePath()}
      className="space-y-3"
      data-gate-form={isGate ? "open" : "gate"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isGate ? "open" : "gate"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/gate`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isGate ? GATE_LEAVE_LINE : GATE_TABLE_LINE}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isGate
          ? "Clear the tape. Status and the tote stay put."
          : `${GATE_STAYS_LINE} ${GATE_SHOTS_LINE} ${GATE_LOOP_LINE} ${GATE_STILL_LINE} ${GATE_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingGateView({
  sheet,
  gateIds,
}: {
  sheet: GateViewSheet;
  gateIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <GateMissing />;
  }

  if (sheet.kind !== "digital") {
    return <GateRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-gate-sheet="digital"
      data-gate-state={sheet.isGate ? "gate" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: GATE_MIRROR_SCRIPT }} />
      <SyncGate listingIds={gateIds} />

      <MallHero>
        <MallCrumb label="I will not gate it">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Gate</span>
        </MallCrumb>

        <MallEyebrow>I will not gate it</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isGate ? GATE_NOTICE_TITLE : GATE_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {GATE_TABLE_LINE} {GATE_SHOTS_LINE} {GATE_LOOP_LINE}{" "}
            {GATE_WALK_LINE} {GATE_STAYS_LINE} {GATE_STILL_LINE}{" "}
            {GATE_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-gate-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the lot</MallEyebrow>
            {sheet.isGate ? (
              <Badge variant="outline">I will not gate it</Badge>
            ) : (
              <Badge variant="ghost">Still twelve shots</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Gate paper
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
            {sheet.isGate
              ? "Still for sale. Seller taped the gate note. Status stays available. Not a mix."
              : "Still twelve shots. Still a loop. Tape it when walkers still want the tails gone."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isGate ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="I will not gate it"
              title={GATE_NOTICE_TITLE}
              body={`${GATE_STILL_LINE} avail=open still lists this file.`}
            />
          ) : (
            <ListingGateEmpty listingId={sheet.listingId} />
          )}

          <GateForm listingId={sheet.listingId} isGate={sheet.isGate} />

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
