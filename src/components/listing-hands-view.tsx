import Link from "next/link";

import { SyncHands } from "@/components/listing-hands-sync";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { exploreHref } from "@/lib/browse";
import { CART_MIRROR_SCRIPT } from "@/lib/cart";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  HANDS_FILE_COPY,
  HANDS_GIFT_COPY,
  HANDS_GONE_COPY,
  HANDS_LOOK_LINE,
  HANDS_MIRROR_SCRIPT,
  HANDS_MISSING_COPY,
  HANDS_PDF_LINE,
  HANDS_SOLD_COPY,
  HANDS_TOTE_LINE,
  HANDS_WALK_LINE,
} from "@/lib/in-hands";
import {
  listingHandsWritePath,
  listingPath,
  stallPath,
} from "@/lib/paths";
import { cn } from "@/lib/utils";

export type HandsViewKind =
  | "physical"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "missing";

export type HandsViewSheet = {
  kind: HandsViewKind;
  listingId: string;
  walking: boolean;
  title: string | null;
  priceLabel: string | null;
  fact: string | null;
  stallName: string | null;
  stallSlug: string | null;
  hubName: string | null;
  listing: Listing | null;
};

function HandsMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title={HANDS_MISSING_COPY}
      body="No SKU with that id. It never sat on a table, or the scrap tore off with the listing."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/explore" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}

function HandsRefused({ sheet }: { sheet: HandsViewSheet }) {
  const gift = sheet.kind === "gift";
  const file = sheet.kind === "digital" || sheet.kind === "file-gone";
  const title = gift
    ? HANDS_GIFT_COPY
    : file
      ? sheet.kind === "file-gone"
        ? HANDS_GONE_COPY
        : HANDS_FILE_COPY
      : HANDS_SOLD_COPY;

  return (
    <MallNotice
      tone="empty"
      eyebrow={gift ? "Gift desk" : file ? "Files stay in the folder" : "Walked"}
      title={title}
      body={
        <div className="space-y-2" data-hands-sheet={sheet.kind}>
          <p>
            {sheet.fact ? (
              <>
                <span className="font-medium text-foreground">{sheet.fact}</span>
                {sheet.stallName ? <> · {sheet.stallName}</> : null}
              </>
            ) : (
              "Hands is a lamp leaving the aisle, not a PDF and not a gift code."
            )}
          </p>
          <p>{HANDS_WALK_LINE}</p>
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

function HandsForm({
  listingId,
  walking,
}: {
  listingId: string;
  walking: boolean;
}) {
  return (
    <form
      method="post"
      action={listingHandsWritePath()}
      className="space-y-3"
      data-hands-form={walking ? "open" : "hands"}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={walking ? "open" : "hands"} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listings/${encodeURIComponent(listingId)}/hands`}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full sm:w-auto",
        )}
      >
        {walking ? "Back on the table" : "In someone's hands"}
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        {walking
          ? "Put-back restores the tote. Status stays available — this was never a sold sticker."
          : `${HANDS_TOTE_LINE} ${HANDS_LOOK_LINE} ${HANDS_PDF_LINE}`}
      </p>
    </form>
  );
}

export function ListingHandsView({
  sheet,
  handsIds,
}: {
  sheet: HandsViewSheet;
  handsIds: string[];
}) {
  if (sheet.kind === "missing") {
    return <HandsMissing />;
  }

  if (sheet.kind !== "physical") {
    return <HandsRefused sheet={sheet} />;
  }

  const stallHref = sheet.stallSlug ? stallPath(sheet.stallSlug) : null;

  return (
    <div
      data-hands-sheet="physical"
      data-hands-state={sheet.walking ? "hands" : "open"}
    >
      <script dangerouslySetInnerHTML={{ __html: HANDS_MIRROR_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: CART_MIRROR_SCRIPT }} />
      <SyncHands listingIds={handsIds} />

      <MallHero>
        <MallCrumb label="In someone's hands">
          <CrumbSep />
          <Link
            href={listingPath(sheet.listingId)}
            className="hover:text-foreground hover:underline"
          >
            {sheet.title}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Hands</span>
        </MallCrumb>

        <MallEyebrow>Walking away</MallEyebrow>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            {sheet.walking
              ? "Someone walked off with this."
              : "In someone's hands."}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {HANDS_WALK_LINE} {HANDS_TOTE_LINE} {HANDS_LOOK_LINE} {HANDS_PDF_LINE}
          </p>
        </div>
      </MallHero>

      <MallSection
        className="border-b border-border"
        innerClassName="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(16rem,0.95fr)] lg:items-start"
      >
        <article
          data-hands-listing={sheet.listingId}
          className="w-full rounded-2xl bg-card p-5 ring-1 ring-primary/15 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MallEyebrow className="text-current/55">Leaving the aisle</MallEyebrow>
            {sheet.walking ? (
              <Badge variant="outline">In hands</Badge>
            ) : (
              <Badge variant="ghost">Still for sale</Badge>
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
            {sheet.walking
              ? "The tote dropped it. Still-here explore does not list it. Status is still available — this is not a sold sticker. Look stays on the table."
              : "The lamp a walker is carrying down the aisle. Not sold. Look is the one that sits and is not for sale."}
          </p>
        </article>

        <div className="space-y-4">
          {sheet.walking ? (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="In hands"
              title="Not in the tote."
              body="avail=open dropped this lamp. The PDF is still for sale. Look cookie stays put. Put-back restores Add to cart."
            />
          ) : (
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Still for sale"
              title="Nobody walked this yet."
              body="Hands takes it out of the tote aisle without packing the booth or marking it sold."
            />
          )}

          <HandsForm listingId={sheet.listingId} walking={sheet.walking} />

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
