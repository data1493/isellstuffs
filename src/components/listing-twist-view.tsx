import Link from "next/link";

import { ListingTwistEmpty } from "@/components/listing-twist-empty";
import { SyncTwist } from "@/components/listing-twist-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  TWIST_CORD_LINE,
  TWIST_MIRROR_SCRIPT,
  TWIST_NOTICE_TITLE,
  TWIST_REFUSE_COPY,
  TWIST_STILL_LINE,
  TWIST_SWITCH_LINE,
  TWIST_TABLE_LINE,
  TWIST_TOTE_LINE,
} from "@/lib/listing-twist";
import { listingPath, listingTwistWritePath, stallPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type TwistViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type TwistViewSheet = {
  kind: TwistViewKind;
  listingId: string;
  isTwist: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function TwistMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={TWIST_REFUSE_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function TwistRefused({ sheet }: { sheet: TwistViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";

  return (
    <div data-twist-sheet={sheet.kind}>
      <MallNotice
        tone="empty"
        eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
        title={TWIST_REFUSE_COPY}
        body={
          <div className="space-y-2">
            <p>
              {sheet.fact ? (
                <>
                  <span className="font-medium text-foreground">{sheet.fact}</span>
                  {sheet.stallName ? <> · {sheet.stallName}</> : null}
                </>
              ) : (
                "Twist honesty is for a lamp on the table, not a PDF and not a gift code."
              )}
            </p>
            <p>
              {TWIST_NOTICE_TITLE} {TWIST_CORD_LINE} {TWIST_STILL_LINE}
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

function TwistForm({
  listingId,
  isTwist,
}: {
  listingId: string;
  isTwist: boolean;
}) {
  return (
    <form
      method="post"
      action={listingTwistWritePath()}
      className="space-y-3"
      data-twist-form={isTwist ? "open" : "twist"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={isTwist ? "open" : "twist"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/twist`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {isTwist ? "Leave the switch" : "Twist the neck"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {isTwist
          ? "Clear the twist paper. Status and the tote stay put."
          : `${TWIST_SWITCH_LINE} ${TWIST_STILL_LINE} ${TWIST_TOTE_LINE}`}
      </p>
    </form>
  );
}

export function ListingTwistView({
  sheet,
  twistIds,
}: {
  sheet: TwistViewSheet;
  twistIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <TwistMissing />;
  }

  if (sheet.kind !== "physical") {
    return <TwistRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-twist-sheet="physical"
      data-twist-state={sheet.isTwist ? "twist" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: TWIST_MIRROR_SCRIPT }} />
      <SyncTwist listingIds={twistIds} />

      <MallHero>
        <MallCrumb label="Twist the neck">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Twist</span>
        </MallCrumb>

        <MallEyebrow>Twist the neck</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.isTwist ? TWIST_NOTICE_TITLE : TWIST_TABLE_LINE}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {TWIST_NOTICE_TITLE} {TWIST_CORD_LINE} {TWIST_STILL_LINE}{" "}
            {TWIST_TOTE_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-twist-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">On the table</MallEyebrow>
            {sheet.isTwist ? (
              <Badge variant="outline">Twist the neck</Badge>
            ) : (
              <Badge variant="ghost">Twist not taped</Badge>
            )}
          </div>

          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Twist paper
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
            {sheet.isTwist
              ? "Still for sale. Seller will not replace the switch. Twist the neck. Status stays available. Not a hardware shop."
              : "Crack is the glaze. Cord is the rewire. Box is the shade. Tape it when walkers want a new switch."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.isTwist ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Twist the neck"
              title={TWIST_NOTICE_TITLE}
              body={`${TWIST_SWITCH_LINE} ${TWIST_STILL_LINE} avail=open still lists this pile.`}
            />
          ) : (
            <ListingTwistEmpty listingId={sheet.listingId} />
          )}

          <TwistForm listingId={sheet.listingId} isTwist={sheet.isTwist} />

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
